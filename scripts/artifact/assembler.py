"""
Assemble la copie du site à publier sur l'hébergeur Claude (Artifact).

    ARTIFACT=1 npx next build
    python3 scripts/artifact/assembler.py <dossier de sortie> [<dossier d'instantané>]

Instantané (facultatif) : un dossier de réponses JSON de l'API d'un vrai
auteur (overview.json, stories.json, book.json, book-plan.json, photos.json).
Il est glissé dans la page de l'espace auteur, qui s'ouvre alors sur ce
profil au lieu du livre d'exemple. Ces fichiers ne vont jamais dans Git.

Le site y est servi sous un sous-chemin : toutes les adresses deviennent relatives.
Écrit aussi <sortie>/../files.json, la liste des fichiers à publier avec la page.
"""
import json, os, re, shutil, sys

OUT = sys.argv[1]
SRC = ".next-artifact/server/app"
PAGES = ["index", "about", "cgv", "contact", "dashboard", "experience", "faq", "legal", "offre", "order", "privacy"]

# Réécrit en relatif les adresses que React remet en absolu, et navigue en relatif au clic.
HEAD = '''<script>(function(){function rel(u){return u&&u.charAt(0)==="/"&&u.charAt(1)!=="/"?"."+u:u}
function fix(el){if(!el.getAttribute)return;["src","href","poster"].forEach(function(a){if(a==="href"&&el.tagName==="A")return;var v=el.getAttribute(a);if(v&&rel(v)!==v)el.setAttribute(a,rel(v))});var s=el.getAttribute("srcset");if(s){var t=s.split(",").map(function(p){return rel(p.trim())}).join(", ");if(t!==s)el.setAttribute("srcset",t)}}
function sweep(n){if(n.nodeType!==1)return;fix(n);var l=n.querySelectorAll("img,source,link,video");for(var i=0;i<l.length;i++)fix(l[i])}
new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==="attributes")fix(m.target);else m.addedNodes.forEach(sweep)})}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["src","srcset","href","poster"]});
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a||a.target||e.metaKey||e.ctrlKey)return;var h=a.getAttribute("href");if(/^(https?:|mailto:|tel:|#)/.test(h))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(h.charAt(0)==="/")h=h==="/"?"./":"."+h;location.href=new URL(h,document.baseURI).href;},true);})();</script>'''

shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT + "/n")
shutil.copytree(".next-artifact/static", OUT + "/n/static")
shutil.copytree("public", OUT, dirs_exist_ok=True)
shutil.copy("app/icon.png", OUT + "/icon.png")

def read(p): return open(p, encoding="utf-8").read()
def write(p, s): open(p, "w", encoding="utf-8").write(s)

SNAPSHOT = ""
if len(sys.argv) > 2:
    snap = {n: json.load(open(os.path.join(sys.argv[2], n + ".json"), encoding="utf-8"))
            for n in ("overview", "stories", "book", "book-plan", "photos")
            if os.path.exists(os.path.join(sys.argv[2], n + ".json"))}
    SNAPSHOT = "<script>window.__LOOMINA_SNAPSHOT__=" + json.dumps(snap, ensure_ascii=False).replace("</", "<\\/") + "</script>"

for p in PAGES:
    s = read(f"{SRC}/{p}.html").replace("/_next/", "./n/")
    for a in ("href", "src"):
        s = s.replace(a + '="/', a + '="./').replace('\\"' + a + '\\":\\"/', '\\"' + a + '\\":\\"./')
    # L'hébergeur enveloppe la page d'accueil dans un squelette qui impose body{background:#fff} hors calque :
    # il passerait devant les utilitaires Tailwind (rangés en calque). On remet le fond du site, hors calque aussi.
    head = HEAD + "<style>body{background:var(--canvas)}</style>" + (SNAPSHOT if p == "dashboard" else "")
    write(os.path.join(OUT, "index.html" if p == "index" else p), s.replace("<head>", "<head>" + head, 1))

for d, _, fs in os.walk(OUT + "/n"):
    for f in fs:
        if f.endswith((".js", ".css")):
            q = os.path.join(d, f)
            s = read(q).replace("/_next/", "./n/")
            if f.endswith(".js"):
                s = s.replace("�", "\\uFFFD")
                s = re.sub(r'"/(photos/|toile/|espace-auteur/|header-logo|hero-book|icon\.png|og-image)', r'"./\1', s)
            write(q, s)

files = {}
for d, _, fs in os.walk(OUT):
    for f in fs:
        rel = os.path.relpath(os.path.join(d, f), OUT)
        if f == ".DS_Store" or f.endswith(".map") or rel == "index.html":
            continue
        files[rel] = {"from": rel, "contentType": "text/html"} if rel in PAGES else rel
json.dump(files, open(os.path.join(OUT, "..", "files.json"), "w"), ensure_ascii=False)
print(len(files), "fichiers")
