"""Build the Quick Staffing Protocol one-pagers in public/downloads/.

    python3 scripts/quick-staffing-protocol/build.py [en de ro]

Needs wkhtmltopdf 0.12.6 and the Poppins font installed on the system
(Regular, Medium, Bold, Italic). Edit the texts in CONTENT below, then rebuild
all three languages so they stay in step.
"""
import html
import pathlib
import subprocess
import sys
import tempfile
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[2]
LOGO = ROOT / 'public' / 'RSA - Logo + Text  Horizzontal - Default.png'
OUT = ROOT / 'public' / 'downloads'
SITE_URL = 'https://rsasoft.ro/'
BOOKING_URL = ('https://calendar.google.com/calendar/appointments/schedules/'
               'AcZssZ3PggS-kWzLqcvgiPYcwZyYi3YANL3y07u8ilKk5ZXJQsR7n_sKPfPO6cy-nXafhJ41PtPVMilL')
# wkhtmltopdf with unpatched Qt prints 1 CSS px as about 0.577 pt, so a 794 px layout
# would fill only two thirds of the A4 width. ZOOM scales the layout up to fill the page.
ZOOM = 1.13

CONTENT = {
    'en': {
        'title': 'How I staff a niche software role in DACH automotive, banking or fintech, '
                 'with the first vetted profiles within a week',
        'lede': 'A one-page reference you can forward to your team, your CTO, or procurement '
                'before the next sprint planning call.',
        'p1': 'You post a role. Your recruiter finds 40 resumes. None of them fit. Meanwhile '
              'your roadmap slips and your own team absorbs the extra load.',
        'p2': ('That gap is what the ', 'Quick Staffing Protocol',
               ' closes, fast. Not a resume search. A protocol.'),
        'how': 'How the protocol works',
        'steps': [
            ('Day 1', 'Scope', 'You tell me the role, the stack, the niche requirement. '
             'I get on a call and get it exact. No questionnaire.'),
            ('Days 2-4', 'Match', 'I pull from developers already vetted for niche roles in '
             'your industry. Not a cold search that starts after you sign.'),
            ('By day 5', 'Profiles', 'Two or three vetted profiles matched to your stack. '
             'You interview, then they start. Billed hourly. No surprise invoices.'),
        ],
        'bill': 'How I bill',
        'rows': [('Developer salary rate', '€X /hour'), ('RSA SOFT margin', '€10 /hour')],
        'total': ('What you get billed', 'Salary rate + €10 /hour, nothing hidden'),
        'note': 'The rate stays the same whether the search takes one week or four. '
                "Speed doesn't cost you a hidden premium.",
        'get': 'What you get',
        'get_items': [
            'Vetted profiles for your niche stack within a week, not months',
            'Full visibility into what you pay: salary rate + €10/h margin',
            'No legal exposure of a direct hire gone wrong',
            'A developer who knows your project like your own team does',
        ],
        'removes': 'What this removes',
        'removes_items': [
            'The months-long search for specialized, niche staff',
            'The legal risk of getting a hire wrong',
            'The guesswork of what an agency charges on top of the rate',
            'The risk of a developer who checks out halfway through',
        ],
        'footer': 'Quick Staffing Protocol for DACH enterprise teams',
        'cta': 'Book your scoping call',
    },
    'de': {
        'title': 'So besetze ich Nischen-Softwarerollen in Automotive, Banking und Fintech '
                 '(DACH): erste geprüfte Profile in einer Woche',
        'lede': 'Eine einseitige Referenz, die Sie an Ihr Team, Ihren CTO oder den Einkauf '
                'weiterleiten können, vor dem nächsten Sprint Planning.',
        'p1': 'Sie schreiben eine Rolle aus. Ihr Recruiter findet 40 Lebensläufe. Keiner passt. '
              'Ihre Roadmap verzögert sich, und Ihr eigenes Team übernimmt die zusätzliche Last.',
        'p2': ('Genau diese Lücke schließt das ', 'Quick Staffing Protocol',
               ', schnell. Keine Lebenslauf-Suche. Ein Protokoll.'),
        'how': 'So funktioniert das Protokoll',
        'steps': [
            ('Tag 1', 'Scope', 'Sie nennen mir die Rolle, den Stack, die Nischenanforderung. '
             'Wir telefonieren und klären es exakt. Kein Fragebogen.'),
            ('Tag 2-4', 'Match', 'Ich greife auf bereits geprüfte Entwickler für Nischenrollen '
             'in Ihrer Branche zurück. Keine Suche, die erst nach Vertragsabschluss startet.'),
            ('Bis Tag 5', 'Profile', 'Zwei bis drei geprüfte Profile passend zu Ihrem Stack. '
             'Sie interviewen, dann startet die Person. Abrechnung stundenweise. '
             'Keine Überraschungsrechnungen.'),
        ],
        'bill': 'So rechne ich ab',
        'rows': [('Gehaltssatz des Entwicklers', '€X /Stunde'), ('RSA SOFT Marge', '€10 /Stunde')],
        'total': ('Was Ihnen berechnet wird', 'Gehaltssatz + €10 /Stunde, nichts versteckt'),
        'note': 'Der Satz bleibt gleich, egal ob die Suche eine Woche oder vier dauert. '
                'Geschwindigkeit kostet Sie keinen versteckten Aufschlag.',
        'get': 'Das bekommen Sie',
        'get_items': [
            'Geprüfte Profile für Ihren Nischen-Stack innerhalb einer Woche, nicht nach Monaten',
            'Volle Transparenz darüber, was Sie zahlen: Gehaltssatz + €10/h Marge',
            'Kein rechtliches Risiko einer missglückten Direktanstellung',
            'Einen Entwickler, der Ihr Projekt so gut kennt wie Ihr eigenes Team',
        ],
        'removes': 'Das entfällt dadurch',
        'removes_items': [
            'Die monatelange Suche nach spezialisiertem Nischenpersonal',
            'Das rechtliche Risiko einer Fehlbesetzung',
            'Das Rätselraten, was eine Agentur zusätzlich zum Satz berechnet',
            'Das Risiko, dass ein Entwickler auf halbem Weg aussteigt',
        ],
        'footer': 'Quick Staffing Protocol für DACH Enterprise-Teams',
        'cta': 'Scoping-Call buchen',
    },
    'ro': {
        'title': 'Cum acopăr un rol software de nișă în DACH, în automotive, banking sau fintech: '
                 'primele profiluri verificate într-o săptămână',
        'lede': 'O pagină de referință pe care o poți trimite mai departe echipei tale, CTO-ului, '
                'sau departamentului de achiziții, înainte de următorul sprint planning.',
        'p1': 'Postezi un rol. Recrutorul tău găsește 40 de CV-uri. Niciunul nu se potrivește. '
              'Între timp roadmap-ul tău întârzie, iar echipa ta preia sarcina în plus.',
        'p2': ('Acel gol este ceea ce închide ', 'Quick Staffing Protocol',
               ', rapid. Nu o căutare de CV-uri. Un protocol.'),
        'how': 'Cum funcționează protocolul',
        'steps': [
            ('Ziua 1', 'Scop', 'Îmi spui rolul, stack-ul, cerința de nișă. Vorbim la telefon '
             'și stabilim exact ce ai nevoie. Fără chestionar.'),
            ('Zilele 2-4', 'Potrivire', 'Aleg dintre dezvoltatori deja verificați pentru roluri '
             'de nișă în industria ta. Nu o căutare care începe după semnare.'),
            ('Până în ziua 5', 'Profiluri', 'Două sau trei profiluri verificate, potrivite '
             'stack-ului tău. Le intervievezi, apoi începe omul ales. Facturare pe oră. '
             'Fără facturi surpriză.'),
        ],
        'bill': 'Cum facturez',
        'rows': [('Rata salarială a dezvoltatorului', '€X /oră'), ('Marja RSA SOFT', '€10 /oră')],
        'total': ('Ce ți se facturează', 'Rata salarială + €10 /oră, nimic ascuns'),
        'note': 'Rata rămâne aceeași indiferent dacă recrutarea durează o săptămână sau patru. '
                'Viteza nu te costă un premium ascuns.',
        'get': 'Ce primești',
        'get_items': [
            'Profiluri verificate pentru stack-ul tău de nișă într-o săptămână, nu în luni',
            'Vizibilitate completă asupra a ceea ce plătești: rată salarială + marjă €10/h',
            'Fără riscul legal al unei angajări directe eșuate',
            'Un dezvoltator care cunoaște proiectul tău la fel de bine ca echipa ta',
        ],
        'removes': 'Ce elimină asta',
        'removes_items': [
            'Căutarea de luni de zile pentru personal specializat, de nișă',
            'Riscul legal al unei angajări greșite',
            'Necunoscutele legate de cât percepe o agenție peste rată',
            'Riscul unui dezvoltator care renunță pe parcurs',
        ],
        'footer': 'Quick Staffing Protocol pentru echipe enterprise din DACH',
        'cta': 'Programează un call de scoping',
    },
}

CSS = """
html, body { margin: 0; padding: 0; background: #fff; }
body { zoom: ZOOM_VALUE; }
body { font-family: 'Poppins', sans-serif; color: #000; }
.page { width: 794px; margin: 0 auto; padding: 40px 68px 0; box-sizing: border-box; }
.bar { height: 6px; background: #2b5494; }
.logo { display: block; height: 34px; margin-top: 34px; }
.eyebrow { margin-top: 23px; font-size: 11px; line-height: 16px; font-weight: 500;
  letter-spacing: 2px; color: #2b5494; text-transform: uppercase; }
h1 { margin: 4px 0 0; max-width: 620px; font-size: 27px; line-height: 32px; font-weight: 700; }
.lede { margin: 16px 0 0; font-size: 13px; line-height: 19px; color: #333; }
.body { margin: 30px 0 0; font-size: 14px; line-height: 23px; }
.body.next { margin-top: 23px; }
.body strong { color: #2b5494; font-weight: 700; }
h2 { margin: 0; font-size: 14px; line-height: 23px; font-weight: 700; color: #2b5494;
  text-transform: uppercase; }
.section { margin-top: 26px; border-top: 1px solid #dbe3ee; padding-top: 6px; }
table { width: 100%; border-collapse: collapse; border-spacing: 0; }
table.steps { margin-top: 14px; table-layout: fixed; }
table.steps td { vertical-align: top; background: #f8fafc; border-left: 3px solid #2b5494;
  padding: 15px 18px 15px 19px; }
.step-label { font-size: 10px; line-height: 14px; font-weight: 700; color: #2b5494;
  letter-spacing: 0.8px; text-transform: uppercase; }
.step-title { margin-top: 9px; font-size: 12px; line-height: 17px; font-weight: 500; }
.step-text { margin-top: 8px; font-size: 11px; line-height: 16px; color: #333; }
.billbox { margin-top: 13px; background: #f8fafc; padding: 18px 23px 19px; }
.billbox td { padding: 9px 0; font-size: 13px; line-height: 18px; color: #333; }
.billbox td.v { text-align: right; color: #000; }
.billbox tr.sep td { border-top: 1px solid #e2e8f0; }
.billbox tr.total td { font-weight: 700; color: #333; }
.billbox tr.total td.v { color: #2b5494; }
.note { margin-top: 15px; font-size: 11px; line-height: 16px; font-style: italic; color: #2b5494; }
table.cols { margin-top: 16px; table-layout: fixed; }
table.cols td { vertical-align: top; border-top: 1px solid #dbe3ee; padding: 6px 0 0; }
table.cols td.c1 { padding-right: 8px; }
ul { list-style: none; margin: 13px 0 0; padding: 0; }
li { position: relative; padding-left: 17px; margin: 0 0 7px; font-size: 11px; line-height: 15px;
  color: #222; }
li:before { content: ''; position: absolute; left: 2px; top: 6px; width: 3px; height: 3px;
  background: #222; -webkit-transform: rotate(45deg); }
.footer { margin-top: 19px; border-top: 2px solid #2b5494; padding-top: 18px; }
.footer td { font-size: 11px; line-height: 16.5px; vertical-align: middle; }
.footer td.l { color: #555; }
.footer td.r { text-align: right; }
.footer a { text-decoration: none; display: block; }
.footer a.site { font-weight: 700; color: #2b5494; }
.footer a.cta { color: #000; }
"""


def esc(text):
    return html.escape(text, quote=True)


def render(lang, c):
    steps = ''.join(
        f'<td><div class="step-label">{esc(label)}</div><div class="step-title">{esc(title)}</div>'
        f'<div class="step-text">{esc(text)}</div></td>'
        for label, title, text in c['steps'])
    rows = ''.join(
        f'<tr{" class=\"sep\"" if i else ""}><td>{esc(k)}</td><td class="v">{esc(v)}</td></tr>'
        for i, (k, v) in enumerate(c['rows']))
    total = f'<tr class="sep total"><td>{esc(c["total"][0])}</td><td class="v">{esc(c["total"][1])}</td></tr>'
    get_items = ''.join(f'<li>{esc(t)}</li>' for t in c['get_items'])
    removes_items = ''.join(f'<li>{esc(t)}</li>' for t in c['removes_items'])
    before, strong, after = c['p2']
    logo = 'file://' + urllib.parse.quote(str(LOGO))
    return f"""<!DOCTYPE html>
<html lang="{lang}"><head><meta charset="utf-8"><title>Quick Staffing Protocol</title>
<style>{CSS.replace('ZOOM_VALUE', str(ZOOM))}</style></head><body><div class="page">
<div class="bar"></div>
<img class="logo" src="{logo}" alt="RSA SOFT">
<div class="eyebrow">Quick Staffing Protocol</div>
<h1>{esc(c['title'])}</h1>
<p class="lede">{esc(c['lede'])}</p>
<p class="body">{esc(c['p1'])}</p>
<p class="body next">{esc(before)}<strong>{esc(strong)}</strong>{esc(after)}</p>
<div class="section"><h2>{esc(c['how'])}</h2><table class="steps"><tr>{steps}</tr></table></div>
<div class="section"><h2>{esc(c['bill'])}</h2>
<div class="billbox"><table>{rows}{total}</table></div></div>
<div class="note">&#8627; {esc(c['note'])}</div>
<table class="cols"><tr>
<td class="c1"><h2>{esc(c['get'])}</h2><ul>{get_items}</ul></td>
<td class="c2"><h2>{esc(c['removes'])}</h2><ul>{removes_items}</ul></td>
</tr></table>
<div class="footer"><table><tr>
<td class="l">{esc(c['footer'])}</td>
<td class="r"><a class="site" href="{SITE_URL}">rsasoft.ro</a><a class="cta" href="{BOOKING_URL}">{esc(c['cta'])}</a></td>
</tr></table></div>
</div></body></html>"""


def build(lang):
    with tempfile.TemporaryDirectory() as tmp:
        src = pathlib.Path(tmp) / f'qsp-{lang}.html'
        src.write_text(render(lang, CONTENT[lang]), encoding='utf-8')
        out = OUT / f'rsa-soft-quick-staffing-protocol-{lang}.pdf'
        subprocess.run([
            'wkhtmltopdf', '--quiet', '--enable-local-file-access',
            '--page-size', 'A4', '--margin-top', '0', '--margin-bottom', '0',
            '--margin-left', '0', '--margin-right', '0',
            '--title', 'Quick Staffing Protocol', str(src), str(out),
        ], check=True)
        print(f'built {out.relative_to(ROOT)}')


if __name__ == '__main__':
    for lang in sys.argv[1:] or CONTENT:
        build(lang)
