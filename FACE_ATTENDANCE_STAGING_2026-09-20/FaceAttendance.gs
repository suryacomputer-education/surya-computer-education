/* ==================================================
   SURYA COMPUTER OF EDUCATION CENTER
   File    : FaceAttendance.gs
   Version : v1.0.0
   Purpose : Browser-side face profile storage + secure
             automatic attendance endpoints.

   IMPORTANT:
   - Face detection/embedding is performed in the browser.
   - This backend stores only the numeric face descriptor,
     not continuous camera video.
   - Every write requires a valid admin session.
================================================== */
"use strict";

const SURYA_FACE_PROFILE_SHEET = "FaceProfiles";
const SURYA_FACE_PROFILE_HEADERS = [
  "Student ID","Course","Student Name","Descriptor JSON",
  "Profile Version","Sample Count","Status","Reference Source",
  "Created At","Updated At","Registered By"
];

function faceEnsureSheet_() {
  const ss = getSuryaSpreadsheet();
  let sh = ss.getSheetByName(SURYA_FACE_PROFILE_SHEET);
  if (!sh) sh = ss.insertSheet(SURYA_FACE_PROFILE_SHEET);

  const last = sh.getLastColumn();
  const current = last
    ? sh.getRange(1,1,1,last).getValues()[0].map(function(v){return String(v || "").trim();})
    : [];

  if (!current.length || current.every(function(v){return !v;})) {
    sh.getRange(1,1,1,SURYA_FACE_PROFILE_HEADERS.length)
      .setValues([SURYA_FACE_PROFILE_HEADERS]);
  } else {
    SURYA_FACE_PROFILE_HEADERS.forEach(function(h){
      if (current.indexOf(h) === -1) {
        sh.getRange(1,sh.getLastColumn()+1).setValue(h);
      }
    });
  }
  sh.setFrozenRows(1);
  return sh;
}

function faceRows_() {
  const sh = faceEnsureSheet_();
  if (sh.getLastRow() < 2) return [];
  const headers = sh.getRange(1,1,1,sh.getLastColumn())
    .getValues()[0].map(function(v){return String(v || "").trim();});

  return sh.getRange(2,1,sh.getLastRow()-1,sh.getLastColumn())
    .getValues().map(function(row,i){
      const o = {_row:i+2};
      headers.forEach(function(h,j){ if (h) o[h] = row[j]; });
      return o;
    });
}

function faceAdminActor_(token) {
  try {
    const raw = PropertiesService.getScriptProperties()
      .getProperty(PROP_SESSION_PREFIX + String(token || ""));
    if (raw) {
      const s = JSON.parse(raw);
      return String(s.username || "ADMIN");
    }
  } catch (e) {}
  return "ADMIN";
}

function faceStudentById_(studentId) {
  const sid = String(studentId || "").trim().toUpperCase();
  if (!sid) return null;

  const sh = getSheet(SURYA_STUDENTS_SHEET);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return null;

  const headers = values[0].map(function(v){return String(v || "").trim();});
  const idCol = headers.indexOf("Student ID");
  if (idCol < 0) return null;

  for (let i=1;i<values.length;i++) {
    if (String(values[i][idCol] || "").trim().toUpperCase() === sid) {
      const o = {};
      headers.forEach(function(h,j){ if (h) o[h] = values[i][j]; });
      return o;
    }
  }
  return null;
}

function faceDescriptorValidate_(descriptor) {
  if (!Array.isArray(descriptor) || descriptor.length < 64 || descriptor.length > 256) {
    throw new Error("Invalid face descriptor.");
  }
  const clean = descriptor.map(function(v){
    const n = Number(v);
    if (!isFinite(n)) throw new Error("Face descriptor contains invalid values.");
    return Math.max(-2, Math.min(2, n));
  });
  return clean;
}

function faceDescriptorAverage_(samples) {
  if (!Array.isArray(samples) || samples.length < 1 || samples.length > 10) {
    throw new Error("1 to 10 face samples are required.");
  }
  const vectors = samples.map(faceDescriptorValidate_);
  const len = vectors[0].length;
  vectors.forEach(function(v){
    if (v.length !== len) throw new Error("Face sample sizes do not match.");
  });
  const out = new Array(len).fill(0);
  vectors.forEach(function(v){
    for (let i=0;i<len;i++) out[i] += v[i];
  });
  for (let i=0;i<len;i++) out[i] /= vectors.length;

  let norm = 0;
  for (let i=0;i<len;i++) norm += out[i] * out[i];
  norm = Math.sqrt(norm) || 1;
  return out.map(function(v){return v / norm;});
}

function faceProfileSave_(token, studentId, selectedCourse, samples, referenceSource) {
  if (!verifyAdminSession(token)) {
    return {success:false,authenticated:false,message:"Unauthorized. Admin login required."};
  }

  const student = faceStudentById_(studentId);
  if (!student) return {success:false,message:"Student not found."};

  const sid = String(student["Student ID"] || studentId).trim().toUpperCase();
  const studentCourse = String(student.Course || "").trim();
  const course = String(selectedCourse || "").trim();
  if (!course || course !== studentCourse) return {success:false,message:"Student/course mismatch."};
  if (!Array.isArray(samples) || samples.length < 3) return {success:false,message:"At least 3 live face samples are required."};
  const descriptor = faceDescriptorAverage_(samples);
  const sh = faceEnsureSheet_();
  const rows = faceRows_();
  const existing = rows.find(function(r){
    return String(r["Student ID"] || "").trim().toUpperCase() === sid;
  });

  const actor = faceAdminActor_(token);
  const now = new Date();
  const values = {
    "Student ID": sid,
    "Course": course,
    "Student Name": String(student["Student Name"] || ""),
    "Descriptor JSON": JSON.stringify(descriptor),
    "Profile Version": "FACE-V1",
    "Sample Count": samples.length,
    "Status": "Active",
    "Reference Source": String(referenceSource || "CAMERA").slice(0,40),
    "Updated At": now,
    "Registered By": actor
  };

  const headers = sh.getRange(1,1,1,sh.getLastColumn())
    .getValues()[0].map(function(v){return String(v || "").trim();});

  if (existing) {
    Object.keys(values).forEach(function(k){
      const c = headers.indexOf(k) + 1;
      if (c > 0) sh.getRange(existing._row,c).setValue(values[k]);
    });
  } else {
    values["Created At"] = now;
    sh.appendRow(SURYA_FACE_PROFILE_HEADERS.map(function(h){
      return values[h] !== undefined ? values[h] : "";
    }));
  }

  return {
    success:true,
    message: existing ? "Face profile re-registered successfully." : "Face profile registered successfully.",
    studentId:sid,
    sampleCount:samples.length,
    profileVersion:"FACE-V1"
  };
}

function faceProfilesGet_(token) {
  if (!verifyAdminSession(token)) {
    return {success:false,authenticated:false,message:"Unauthorized. Admin login required."};
  }

  return {
    success:true,
    profiles:faceRows_().map(function(r){
      let descriptor = null;
      try { descriptor = JSON.parse(String(r["Descriptor JSON"] || "null")); } catch(e) {}
      return {
        studentId:String(r["Student ID"] || ""),
        course:String(r.Course || ""),
        studentName:String(r["Student Name"] || ""),
        descriptor:descriptor,
        profileVersion:String(r["Profile Version"] || ""),
        sampleCount:Number(r["Sample Count"] || 0),
        status:String(r.Status || "Active"),
        referenceSource:String(r["Reference Source"] || ""),
        updatedAt:r["Updated At"] || ""
      };
    }).filter(function(p){
      return p.studentId && Array.isArray(p.descriptor) && p.status.toUpperCase() === "ACTIVE";
    })
  };
}

function faceProfileDelete_(token, studentId) {
  if (!verifyAdminSession(token)) {
    return {success:false,authenticated:false,message:"Unauthorized. Admin login required."};
  }
  const sid = String(studentId || "").trim().toUpperCase();
  const sh = faceEnsureSheet_();
  const row = faceRows_().find(function(r){
    return String(r["Student ID"] || "").trim().toUpperCase() === sid;
  });
  if (!row) return {success:false,message:"Face profile not found."};

  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]
    .map(function(v){return String(v || "").trim();});
  const statusCol = headers.indexOf("Status") + 1;
  const updatedCol = headers.indexOf("Updated At") + 1;
  if (statusCol > 0) sh.getRange(row._row,statusCol).setValue("Inactive");
  if (updatedCol > 0) sh.getRange(row._row,updatedCol).setValue(new Date());

  return {success:true,message:"Face profile disabled.",studentId:sid};
}

function faceAttendanceMark_(token, studentId, course, matchScore, liveness) {
  if (!verifyAdminSession(token)) {
    return {success:false,authenticated:false,message:"Unauthorized. Admin login required."};
  }

  const sid = String(studentId || "").trim().toUpperCase();
  const student = faceStudentById_(sid);
  if (!student) return {success:false,message:"Student not found."};

  const studentCourse = String(student.Course || "").trim();
  const selectedCourse = String(course || studentCourse).trim();
  if (!selectedCourse || studentCourse !== selectedCourse) {
    return {success:false,message:"Student/course mismatch."};
  }

  if (String(student.Status || "Active").trim().toUpperCase() !== "ACTIVE") {
    return {success:false,message:"Student account is not active."};
  }

  const score = Number(matchScore);
  if (!isFinite(score) || score < 0 || score > 0.50) {
    return {success:false,message:"Face match score is outside the accepted threshold."};
  }

  const activeProfile = faceRows_().find(function(r){
    return String(r["Student ID"] || "").trim().toUpperCase() === sid &&
      String(r.Course || "").trim() === selectedCourse &&
      String(r.Status || "").trim().toUpperCase() === "ACTIVE";
  });
  if (!activeProfile) return {success:false,message:"Active face profile not found. Register the face first."};

  if (liveness !== true && String(liveness).toLowerCase() !== "true") {
    return {success:false,message:"Live-face verification failed."};
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return {success:false,code:"ATTENDANCE_BUSY",message:"Attendance system is busy. Please try again."};
  try {
    const date = attDate_(new Date());
    const rows = attRows_(SURYA_ATTENDANCE_SHEET,SURYA_ATT_HEADERS);
    const duplicate = rows.find(function(r){
      return String(r["Student ID"] || "").trim().toUpperCase() === sid &&
        String(r.Course || "").trim() === selectedCourse &&
        attDate_(r.Date) === date;
    });

    if (duplicate) {
      return {success:false,duplicate:true,message:"Attendance already marked for this student today.",status:String(duplicate.Status || "")};
    }

    const holiday = attEffectiveStatus_(date,"PRESENT");
    if (holiday.status === "HOLIDAY") return {success:false,holiday:true,message:"Today is a holiday (" + holiday.reason + ")."};

    const sh = attEnsureSheet_(SURYA_ATTENDANCE_SHEET,SURYA_ATT_HEADERS);
    const now = new Date();
    const actor = faceAdminActor_(token);
    sh.appendRow([feeId_("ATT-"),sid,selectedCourse,now,"PRESENT","Automatic face attendance; liveness verified; match score " + score.toFixed(4),actor,now,now]);

    return {success:true,message:"Automatic face attendance marked successfully.",studentId:sid,studentName:String(student["Student Name"] || ""),course:selectedCourse,date:date,status:"PRESENT",method:"FACE",matchScore:score,liveness:true};
  } finally {
    lock.releaseLock();
  }
}
