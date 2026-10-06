/**
 * SURYA — Google Sign-In for website (same backend flow as the Android app)
 * Usage: SuryaGoogleLogin({mode:'student'|'library', buttonId:'googleBtn', messageId:'googleMsg'})
 */
(function(){
  var GIS_SRC='https://accounts.google.com/gsi/client';

  function api(body){
    return fetch(window.SURYA_DATABASE_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)})
      .then(function(r){return r.text();})
      .then(function(t){try{return JSON.parse(t);}catch(e){throw new Error('Server से सही जवाब नहीं मिला.');}});
  }

  function loadGis(cb){
    if(window.google&&window.google.accounts&&window.google.accounts.id)return cb(null);
    var s=document.createElement('script');
    s.src=GIS_SRC;s.async=true;s.defer=true;
    s.onload=function(){cb(null);};
    s.onerror=function(){cb(new Error('Google script load नहीं हुई. Internet check करें.'));};
    document.head.appendChild(s);
  }

  window.SuryaGoogleLogin=function(opts){
    var mode=opts.mode==='library'?'library':'student';
    var holder=document.getElementById(opts.buttonId);
    var msg=document.getElementById(opts.messageId);
    var clientId=window.SURYA_GOOGLE_CLIENT_ID;
    if(!holder||!clientId)return;

    function say(t,bad){
      if(!msg)return;
      msg.textContent=t;
      msg.style.color=bad?'#b42318':'';
    }
    function showJoin(kind){
      if(!msg)return;
      var link=kind==='library'
        ? '<a href="library-admission.html">📚 Library membership के लिए apply करें</a>'
        : '<a href="admission.html">🎓 Student admission के लिए apply करें</a>';
      msg.innerHTML+='<div style="margin-top:8px;font-weight:400">नया account बनाने के लिए: '+link+'</div>';
    }

    async function onCredential(resp){
      try{
        say('⏳ Google account verify हो रहा है...');
        var g=await api({action:'studentAccountGoogle',idToken:resp.credential});
        if(!g.success)throw new Error(g.message||'Google login failed.');
        var n=await api({action:'studentAccountNativeSessions',token:g.token});
        if(!n.success)throw new Error(n.message||'Session setup failed.');
        var acc=n.account||g.account||{};

        if(n.studentToken){
          sessionStorage.setItem('SURYA_STUDENT_TOKEN',n.studentToken);
          sessionStorage.setItem('SURYA_STUDENT_ID',acc.studentId||'');
          sessionStorage.setItem('SURYA_STUDENT_AUTH','true');
        }
        if(n.libraryToken){
          sessionStorage.setItem('SURYA_LIBRARY_TOKEN',n.libraryToken);
        }

        if(mode==='library'){
          if(n.libraryToken){location.href='library-dashboard.html';return;}
          say(acc.libraryId?'❌ Library access अभी active नहीं है या approve नहीं हुआ.':'❌ इस Gmail से कोई Library ID linked नहीं है.',true);
          if(!acc.libraryId)showJoin('library');
          return;
        }
        if(n.studentToken){location.href='student-dashboard.html';return;}
        say(acc.studentId?'❌ Student access अभी active नहीं है या approve नहीं हुआ.':'❌ इस Gmail से कोई Student ID linked नहीं है.',true);
        if(!acc.studentId)showJoin('student');
      }catch(e){
        say('❌ '+(e&&e.message?e.message:e),true);
      }
    }

    loadGis(function(err){
      if(err){say('❌ '+err.message,true);return;}
      window.google.accounts.id.initialize({client_id:clientId,callback:onCredential,auto_select:false});
      window.google.accounts.id.renderButton(holder,{theme:'outline',size:'large',text:'continue_with',shape:'pill',width:Math.min(320,Math.max(220,holder.clientWidth||300))});
    });
  };
})();
