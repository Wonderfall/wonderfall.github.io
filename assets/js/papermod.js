(()=>{var e=!0,t=!0,n=!0;function s(){let e=document.getElementById("menu");e&&(e.scrollLeft=localStorage.getItem("menu-scroll-position"),e.onscroll=function(){localStorage.setItem("menu-scroll-position",e.scrollLeft)}),document.querySelectorAll('a[href^="#"]').forEach(e=>{e.addEventListener("click",function(e){e.preventDefault();var t=this.getAttribute("href").substr(1);window.matchMedia("(prefers-reduced-motion: reduce)").matches?document.querySelector(`[id='${decodeURIComponent(t)}']`).scrollIntoView():document.querySelector(`[id='${decodeURIComponent(t)}']`).scrollIntoView({behavior:"smooth"}),t==="top"?history.replaceState(null,null," "):history.pushState(null,null,`#${t}`)})})}function o(){var e=document.getElementById("top-link");window.onscroll=function(){document.body.scrollTop>800||document.documentElement.scrollTop>800?(e.style.visibility="visible",e.style.opacity="1"):(e.style.visibility="hidden",e.style.opacity="0")}}function i(){var e=document.getElementById("theme-toggle");e.addEventListener("click",()=>{document.body.className.includes("dark")?(document.body.classList.remove("dark"),localStorage.setItem("pref-theme","light")):(document.body.classList.add("dark"),localStorage.setItem("pref-theme","dark"))})}function a(){document.querySelectorAll("pre > code").forEach(e=>{const n=e.parentNode.parentNode,t=document.createElement("button");t.classList.add("copy-code"),t.innerHTML="copy";function s(){t.innerHTML="copied!",setTimeout(()=>{t.innerHTML="copy"},2e3)}t.addEventListener("click",t=>{if("clipboard"in navigator){navigator.clipboard.writeText(e.textContent),s();return}const n=document.createRange();n.selectNodeContents(e);const o=window.getSelection();o.removeAllRanges(),o.addRange(n);try{document.execCommand("copy"),s()}catch{}o.removeRange(n)}),n.classList.contains("highlight")?n.appendChild(t):n.parentNode.firstChild==n||(e.parentNode.parentNode.parentNode.parentNode.parentNode.nodeName=="TABLE"?e.parentNode.parentNode.parentNode.parentNode.parentNode.appendChild(t):e.parentNode.appendChild(t))})}function r(){var e=document.getElementById("toc");e&&window.screen.width>1500&&window.screen.height>800&&(e.open=!0)}s(),r(),e&&o(),n&&i(),t&&a()})()