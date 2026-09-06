// Mehrsprachige Texte für Buchungs-E-Mails (DE/EN/CS/SK).
// Fallback ist immer Deutsch.

export type Lang = "de" | "en" | "cs" | "sk";

export const normalizeLang = (v?: string | null): Lang => {
  const l = (v ?? "de").slice(0, 2).toLowerCase();
  return l === "en" || l === "cs" || l === "sk" ? (l as Lang) : "de";
};

const LOCALES: Record<Lang, string> = {
  de: "de-AT",
  en: "en-GB",
  cs: "cs-CZ",
  sk: "sk-SK",
};

export const fmtDate = (s: string, lang: Lang) =>
  new Date(s).toLocaleDateString(LOCALES[lang], {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export const fmtDateTime = (s: string, lang: Lang) =>
  new Date(s).toLocaleString(LOCALES[lang], {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

type Dict = Record<string, string>;

const de: Dict = {
  hello: "Hallo {name},",
  footer: "Bucht M1 · info@buchtm1.at · +43 699 130 35 163",
  priceHeading: "Preisaufstellung",
  totalSum: "Gesamtsumme",
  weekendCard: "Wochenend-Karte",
  license: "Fischerlizenz (72h+)",
  cleaning: "Endreinigung",
  allInclusive: "All you can Eat",
  acc_none: "Ohne Unterkunft",
  acc_hut: "Fischerhütte",
  acc_caravan: "Wohnwagen",
  period: "Zeitraum",
  persons: "Personen",
  anglers: "Angler",
  companionsLabel: "Begleitung",
  accommodation: "Unterkunft",
  bankTransfer: "Banküberweisung",
  recipient: "Empfänger",
  amount: "Betrag",
  reference: "Verwendungszweck",
  deadline: "Frist",
  directions: "Anfahrt",
  directionsText:
    'Bucht M1 · H-9221 Level, Ungarn.<br />Route und Wegbeschreibung: <a href="https://buchtm1.purtuc.at/anfahrt" style="color:#6f7e44;">buchtm1.purtuc.at/anfahrt</a>',

  // deposit_request
  depositSubject: "Vorreservierung {no} – Anzahlung €{deposit}",
  depositTitle: "Vorreservierung bestätigt ✓",
  depositBody:
    "dein Platz <strong>{spot}</strong> ({range}) ist für dich <strong>vorreserviert</strong>. Damit die Reservierung fix wird, überweise bitte die <strong>Anzahlung von €{deposit} ({percent} %)</strong> innerhalb von <strong>{days} Tagen</strong>. Der Restbetrag wird <strong>vor Ort bei der Anreise</strong> bezahlt.",
  depositRefNote:
    "<strong>Verwendungszweck:</strong> {ref}<br />Bitte genau so angeben, sonst können wir die Zahlung nicht zuordnen.",
  depositWarning:
    "Hinweis: Die Anzahlung wird in keinem Fall rückerstattet. Geht die Anzahlung nicht innerhalb von {days} Tagen ein, wird die Vorreservierung automatisch aufgehoben und der Platz wieder freigegeben.",
  depositText:
    "Hallo {name}, dein Platz ist vorreserviert. Bitte überweise die Anzahlung von €{deposit} an {holder}, IBAN {iban}, BIC {bic}. Verwendungszweck: {ref}. Frist: {deadline}. Restbetrag vor Ort. Die Anzahlung wird nicht rückerstattet.",

  // deposit_received
  depRecSubject: "Anzahlung erhalten – Buchung gesichert",
  depRecTitle: "Anzahlung erhalten ✓",
  depRecBody:
    "deine Anzahlung für <strong>{spot}</strong> ({range}) ist bei uns eingegangen. Die Reservierung ist nun verbindlich gesichert.",
  depRecFinal:
    "Der <strong>Restbetrag von €{final}</strong> wird <strong>vor Ort bei der Anreise</strong> bezahlt.",
  depRecText:
    "Hallo {name}, deine Anzahlung für {spot} ({range}) ist eingegangen. Restbetrag €{final} vor Ort bei der Anreise.",

  // final payment
  finReqSubject: "Restzahlung für deine Buchung – €{final}",
  finReqTitle: "Restzahlung fällig",
  finReqBody:
    "deine Anreise zum <strong>{spot}</strong> am <strong>{start}</strong> rückt näher. Bitte begleiche die Restzahlung von <strong>€{final}</strong>.",
  finReqText: "Hallo {name}, bitte Restzahlung €{final}. Verwendungszweck: {ref}.",
  finRecSubject: "Vollständige Zahlung erhalten – wir freuen uns auf dich",
  finRecTitle: "Alles bezahlt ✓",
  finRecBody:
    "deine Restzahlung für <strong>{spot}</strong> ({range}) ist eingegangen. Wir freuen uns auf deinen Besuch!",
  finRecText: "Hallo {name}, deine Restzahlung für {spot} ({range}) ist eingegangen.",

  // cancellation / forfeit
  cancelSubject: "Buchung storniert",
  cancelTitle: "Buchung storniert",
  cancelBody:
    "deine Buchung für <strong>{spot}</strong> ({range}) wurde storniert. Die geleistete Anzahlung wird gemäß unseren Bedingungen nicht rückerstattet.",
  cancelText: "Hallo {name}, deine Buchung für {spot} ({range}) wurde storniert. Anzahlung verfällt.",
  noShowBody:
    "deine Buchung für <strong>{spot}</strong> ({range}) wurde storniert, da die Restzahlung vor Ort nicht erfolgt ist. Die Anzahlung verfällt.",

  // expired
  expiredSubject: "Zahlungsfrist abgelaufen",
  expiredTitle: "Zahlungsfrist abgelaufen",
  expiredBody:
    "deine Vorreservierung für <strong>{spot}</strong> ({range}) wurde nicht innerhalb der Zahlungsfrist beglichen und ist verfallen. Der Platz wurde wieder freigegeben.",
  expiredHint: "Du kannst jederzeit eine neue Buchung vornehmen.",
  expiredText: "Hallo {name}, die Zahlungsfrist für {spot} ({range}) ist abgelaufen. Der Platz ist wieder verfügbar.",

  // paid / approved / rejected / received / refunded
  paidSubject: "Zahlungseingang bestätigt – Buchung gesichert",
  paidTitle: "Zahlung erhalten ✓",
  paidBody:
    "vielen Dank! Wir haben deine Zahlung für <strong>{spot}</strong> ({range}) erhalten. Deine Buchung ist verbindlich gesichert.",
  paidText: "Hallo {name}, wir haben deine Zahlung für {spot} ({range}) erhalten.",
  approvedSubject: "Deine Buchung wurde bestätigt",
  approvedTitle: "Buchung bestätigt ✓",
  approvedBody: "Wir freuen uns, deine Buchung für <strong>{spot}</strong> bestätigen zu können.",
  approvedText: "Hallo {name}, deine Buchung für {spot} ({range}) wurde bestätigt.",
  payNowSubject: "Deine Buchung wurde freigegeben – jetzt bezahlen",
  payNowTitle: "Buchung freigegeben ✓",
  payNowBody:
    "deine Anfrage für <strong>{spot}</strong> ({range}) wurde freigegeben. Bitte schließe die Buchung mit der Zahlung ab.",
  payNowCta: "Jetzt sicher bezahlen",
  payNowFallback: "Falls der Button nicht funktioniert, öffne diesen Link:",
  payNowText: "Hallo {name}, deine Buchung für {spot} ({range}) wurde freigegeben: {url}",
  rejectedSubject: "Update zu deiner Buchungsanfrage",
  rejectedTitle: "Anfrage konnte nicht bestätigt werden",
  rejectedBody:
    "leider können wir deine Anfrage für <strong>{spot}</strong> im Zeitraum <strong>{range}</strong> aktuell nicht bestätigen.",
  rejectedHint: "Falls du andere Termine in Erwägung ziehst, melde dich gerne direkt bei uns.",
  rejectedText: "Hallo {name}, leider können wir deine Anfrage für {spot} ({range}) nicht bestätigen.",
  receivedSubject: "Wir haben deine Buchungsanfrage erhalten",
  receivedTitle: "Anfrage eingegangen",
  receivedBody:
    "vielen Dank für deine Buchungsanfrage für <strong>{spot}</strong> im Zeitraum <strong>{range}</strong>. Wir melden uns in Kürze.",
  receivedText: "Hallo {name}, wir haben deine Anfrage für {spot} ({range}) erhalten.",
  refundedSubject: "Erstattung bearbeitet",
  refundedTitle: "Erstattung bearbeitet",
  refundedBody:
    "deine Buchung für <strong>{spot}</strong> ({range}) wurde storniert und der Betrag erstattet.",
  refundedText: "Hallo {name}, deine Buchung für {spot} ({range}) wurde erstattet.",
};

const en: Dict = {
  hello: "Hello {name},",
  footer: "Bucht M1 · info@buchtm1.at · +43 699 130 35 163",
  priceHeading: "Price breakdown",
  totalSum: "Total",
  weekendCard: "Weekend permit",
  license: "Fishing licence (72h+)",
  cleaning: "Final cleaning",
  allInclusive: "All you can Eat",
  acc_none: "No accommodation",
  acc_hut: "Fishing cabin",
  acc_caravan: "Caravan",
  period: "Dates",
  persons: "People",
  anglers: "anglers",
  companionsLabel: "companions",
  accommodation: "Accommodation",
  bankTransfer: "Bank transfer",
  recipient: "Recipient",
  amount: "Amount",
  reference: "Payment reference",
  deadline: "Deadline",
  directions: "Directions",
  directionsText:
    'Bucht M1 · H-9221 Level, Hungary.<br />Route and directions: <a href="https://buchtm1.purtuc.at/anfahrt" style="color:#6f7e44;">buchtm1.purtuc.at/anfahrt</a>',

  depositSubject: "Pre-reservation {no} – deposit €{deposit}",
  depositTitle: "Pre-reservation confirmed ✓",
  depositBody:
    "your swim <strong>{spot}</strong> ({range}) is <strong>pre-reserved</strong> for you. To confirm the reservation, please transfer the <strong>deposit of €{deposit} ({percent}%)</strong> within <strong>{days} days</strong>. The remaining amount is paid <strong>on site on arrival</strong>.",
  depositRefNote:
    "<strong>Payment reference:</strong> {ref}<br />Please use exactly this reference, otherwise we cannot match your payment.",
  depositWarning:
    "Note: the deposit is non-refundable under any circumstances. If the deposit does not arrive within {days} days, the pre-reservation is cancelled automatically and the swim is released.",
  depositText:
    "Hello {name}, your swim is pre-reserved. Please transfer the deposit of €{deposit} to {holder}, IBAN {iban}, BIC {bic}. Reference: {ref}. Deadline: {deadline}. Balance on site. The deposit is non-refundable.",

  depRecSubject: "Deposit received – booking secured",
  depRecTitle: "Deposit received ✓",
  depRecBody:
    "we have received your deposit for <strong>{spot}</strong> ({range}). Your reservation is now firmly secured.",
  depRecFinal: "The <strong>remaining €{final}</strong> is paid <strong>on site on arrival</strong>.",
  depRecText: "Hello {name}, your deposit for {spot} ({range}) has arrived. Balance €{final} on site.",

  finReqSubject: "Balance due for your booking – €{final}",
  finReqTitle: "Balance due",
  finReqBody:
    "your arrival at <strong>{spot}</strong> on <strong>{start}</strong> is coming up. Please settle the remaining <strong>€{final}</strong>.",
  finReqText: "Hello {name}, please settle the balance of €{final}. Reference: {ref}.",
  finRecSubject: "Payment complete – we look forward to seeing you",
  finRecTitle: "Fully paid ✓",
  finRecBody:
    "your final payment for <strong>{spot}</strong> ({range}) has been received. We look forward to your visit!",
  finRecText: "Hello {name}, your final payment for {spot} ({range}) has been received.",

  cancelSubject: "Booking cancelled",
  cancelTitle: "Booking cancelled",
  cancelBody:
    "your booking for <strong>{spot}</strong> ({range}) has been cancelled. The deposit paid is non-refundable under our terms.",
  cancelText: "Hello {name}, your booking for {spot} ({range}) was cancelled. The deposit is forfeited.",
  noShowBody:
    "your booking for <strong>{spot}</strong> ({range}) was cancelled because the balance was not paid on site. The deposit is forfeited.",

  expiredSubject: "Payment deadline expired",
  expiredTitle: "Payment deadline expired",
  expiredBody:
    "your pre-reservation for <strong>{spot}</strong> ({range}) was not paid within the deadline and has expired. The swim has been released.",
  expiredHint: "You are welcome to make a new booking at any time.",
  expiredText: "Hello {name}, the payment deadline for {spot} ({range}) has expired.",

  paidSubject: "Payment confirmed – booking secured",
  paidTitle: "Payment received ✓",
  paidBody:
    "thank you! We received your payment for <strong>{spot}</strong> ({range}). Your booking is secured.",
  paidText: "Hello {name}, we received your payment for {spot} ({range}).",
  approvedSubject: "Your booking has been confirmed",
  approvedTitle: "Booking confirmed ✓",
  approvedBody: "we are pleased to confirm your booking for <strong>{spot}</strong>.",
  approvedText: "Hello {name}, your booking for {spot} ({range}) has been confirmed.",
  payNowSubject: "Your booking has been released – pay now",
  payNowTitle: "Booking released ✓",
  payNowBody:
    "your request for <strong>{spot}</strong> ({range}) has been released. Please complete the booking with your payment.",
  payNowCta: "Pay securely now",
  payNowFallback: "If the button does not work, open this link:",
  payNowText: "Hello {name}, your booking for {spot} ({range}) was released: {url}",
  rejectedSubject: "Update on your booking request",
  rejectedTitle: "Request could not be confirmed",
  rejectedBody:
    "unfortunately we cannot confirm your request for <strong>{spot}</strong> for <strong>{range}</strong>.",
  rejectedHint: "If you are considering other dates, just get in touch with us.",
  rejectedText: "Hello {name}, we cannot confirm your request for {spot} ({range}).",
  receivedSubject: "We received your booking request",
  receivedTitle: "Request received",
  receivedBody:
    "thank you for your booking request for <strong>{spot}</strong> for <strong>{range}</strong>. We will get back to you shortly.",
  receivedText: "Hello {name}, we received your request for {spot} ({range}).",
  refundedSubject: "Refund processed",
  refundedTitle: "Refund processed",
  refundedBody:
    "your booking for <strong>{spot}</strong> ({range}) was cancelled and the amount refunded.",
  refundedText: "Hello {name}, your booking for {spot} ({range}) was refunded.",
};

const cs: Dict = {
  hello: "Dobrý den {name},",
  footer: "Bucht M1 · info@buchtm1.at · +43 699 130 35 163",
  priceHeading: "Rozpis ceny",
  totalSum: "Celkem",
  weekendCard: "Víkendová povolenka",
  license: "Rybářská licence (72h+)",
  cleaning: "Závěrečný úklid",
  allInclusive: "All you can Eat",
  acc_none: "Bez ubytování",
  acc_hut: "Rybářská chatka",
  acc_caravan: "Karavan",
  period: "Termín",
  persons: "Osoby",
  anglers: "rybáři",
  companionsLabel: "doprovod",
  accommodation: "Ubytování",
  bankTransfer: "Bankovní převod",
  recipient: "Příjemce",
  amount: "Částka",
  reference: "Variabilní symbol / zpráva",
  deadline: "Termín splatnosti",
  directions: "Jak se k nám dostat",
  directionsText:
    'Bucht M1 · H-9221 Level, Maďarsko.<br />Trasa a popis cesty: <a href="https://buchtm1.purtuc.at/anfahrt" style="color:#6f7e44;">buchtm1.purtuc.at/anfahrt</a>',

  depositSubject: "Předrezervace {no} – záloha €{deposit}",
  depositTitle: "Předrezervace potvrzena ✓",
  depositBody:
    "vaše lovné místo <strong>{spot}</strong> ({range}) je pro vás <strong>předrezervováno</strong>. Pro závazné potvrzení prosím uhraďte <strong>zálohu €{deposit} ({percent} %)</strong> do <strong>{days} dnů</strong>. Zbytek se platí <strong>na místě při příjezdu</strong>.",
  depositRefNote:
    "<strong>Zpráva pro příjemce:</strong> {ref}<br />Uveďte prosím přesně takto, jinak nelze platbu přiřadit.",
  depositWarning:
    "Upozornění: záloha se v žádném případě nevrací. Pokud záloha nedorazí do {days} dnů, předrezervace se automaticky ruší a místo se uvolní.",
  depositText:
    "Dobrý den {name}, vaše místo je předrezervováno. Uhraďte prosím zálohu €{deposit} na {holder}, IBAN {iban}, BIC {bic}. Zpráva: {ref}. Termín: {deadline}. Doplatek na místě. Záloha se nevrací.",

  depRecSubject: "Záloha přijata – rezervace potvrzena",
  depRecTitle: "Záloha přijata ✓",
  depRecBody:
    "vaše záloha za <strong>{spot}</strong> ({range}) byla přijata. Rezervace je nyní závazně potvrzena.",
  depRecFinal: "<strong>Doplatek €{final}</strong> se hradí <strong>na místě při příjezdu</strong>.",
  depRecText: "Dobrý den {name}, záloha za {spot} ({range}) byla přijata. Doplatek €{final} na místě.",

  finReqSubject: "Doplatek k vaší rezervaci – €{final}",
  finReqTitle: "Doplatek je splatný",
  finReqBody:
    "váš příjezd na <strong>{spot}</strong> dne <strong>{start}</strong> se blíží. Uhraďte prosím doplatek <strong>€{final}</strong>.",
  finReqText: "Dobrý den {name}, uhraďte prosím doplatek €{final}. Zpráva: {ref}.",
  finRecSubject: "Platba v plné výši přijata – těšíme se na vás",
  finRecTitle: "Vše uhrazeno ✓",
  finRecBody: "váš doplatek za <strong>{spot}</strong> ({range}) byl přijat. Těšíme se na vaši návštěvu!",
  finRecText: "Dobrý den {name}, váš doplatek za {spot} ({range}) byl přijat.",

  cancelSubject: "Rezervace zrušena",
  cancelTitle: "Rezervace zrušena",
  cancelBody:
    "vaše rezervace na <strong>{spot}</strong> ({range}) byla zrušena. Uhrazená záloha se dle našich podmínek nevrací.",
  cancelText: "Dobrý den {name}, rezervace na {spot} ({range}) byla zrušena. Záloha propadá.",
  noShowBody:
    "vaše rezervace na <strong>{spot}</strong> ({range}) byla zrušena, protože doplatek nebyl uhrazen na místě. Záloha propadá.",

  expiredSubject: "Lhůta pro platbu vypršela",
  expiredTitle: "Lhůta pro platbu vypršela",
  expiredBody:
    "vaše předrezervace na <strong>{spot}</strong> ({range}) nebyla uhrazena včas a propadla. Místo bylo opět uvolněno.",
  expiredHint: "Novou rezervaci můžete kdykoli vytvořit znovu.",
  expiredText: "Dobrý den {name}, lhůta pro platbu za {spot} ({range}) vypršela.",

  paidSubject: "Platba potvrzena – rezervace zajištěna",
  paidTitle: "Platba přijata ✓",
  paidBody:
    "děkujeme! Přijali jsme vaši platbu za <strong>{spot}</strong> ({range}). Rezervace je závazně potvrzena.",
  paidText: "Dobrý den {name}, přijali jsme vaši platbu za {spot} ({range}).",
  approvedSubject: "Vaše rezervace byla potvrzena",
  approvedTitle: "Rezervace potvrzena ✓",
  approvedBody: "s radostí potvrzujeme vaši rezervaci na <strong>{spot}</strong>.",
  approvedText: "Dobrý den {name}, vaše rezervace na {spot} ({range}) byla potvrzena.",
  payNowSubject: "Vaše rezervace byla schválena – zaplaťte prosím",
  payNowTitle: "Rezervace schválena ✓",
  payNowBody:
    "vaše poptávka na <strong>{spot}</strong> ({range}) byla schválena. Dokončete prosím rezervaci platbou.",
  payNowCta: "Zaplatit bezpečně",
  payNowFallback: "Pokud tlačítko nefunguje, otevřete tento odkaz:",
  payNowText: "Dobrý den {name}, rezervace na {spot} ({range}) byla schválena: {url}",
  rejectedSubject: "Informace k vaší poptávce",
  rejectedTitle: "Poptávku nelze potvrdit",
  rejectedBody:
    "bohužel nemůžeme potvrdit vaši poptávku na <strong>{spot}</strong> v termínu <strong>{range}</strong>.",
  rejectedHint: "Pokud zvažujete jiné termíny, ozvěte se nám prosím.",
  rejectedText: "Dobrý den {name}, poptávku na {spot} ({range}) bohužel nemůžeme potvrdit.",
  receivedSubject: "Přijali jsme vaši poptávku",
  receivedTitle: "Poptávka přijata",
  receivedBody:
    "děkujeme za poptávku na <strong>{spot}</strong> v termínu <strong>{range}</strong>. Brzy se vám ozveme.",
  receivedText: "Dobrý den {name}, přijali jsme vaši poptávku na {spot} ({range}).",
  refundedSubject: "Vrácení platby zpracováno",
  refundedTitle: "Vrácení platby zpracováno",
  refundedBody: "vaše rezervace na <strong>{spot}</strong> ({range}) byla zrušena a částka vrácena.",
  refundedText: "Dobrý den {name}, částka za rezervaci {spot} ({range}) byla vrácena.",
};

const sk: Dict = {
  hello: "Dobrý deň {name},",
  footer: "Bucht M1 · info@buchtm1.at · +43 699 130 35 163",
  priceHeading: "Rozpis ceny",
  totalSum: "Spolu",
  weekendCard: "Víkendová povolenka",
  license: "Rybárska licencia (72h+)",
  cleaning: "Záverečné upratovanie",
  allInclusive: "All you can Eat",
  acc_none: "Bez ubytovania",
  acc_hut: "Rybárska chatka",
  acc_caravan: "Karavan",
  period: "Termín",
  persons: "Osoby",
  anglers: "rybári",
  companionsLabel: "sprievod",
  accommodation: "Ubytovanie",
  bankTransfer: "Bankový prevod",
  recipient: "Príjemca",
  amount: "Suma",
  reference: "Poznámka pre príjemcu",
  deadline: "Termín splatnosti",
  directions: "Ako sa k nám dostanete",
  directionsText:
    'Bucht M1 · H-9221 Level, Maďarsko.<br />Trasa a popis cesty: <a href="https://buchtm1.purtuc.at/anfahrt" style="color:#6f7e44;">buchtm1.purtuc.at/anfahrt</a>',

  depositSubject: "Predrezervácia {no} – záloha €{deposit}",
  depositTitle: "Predrezervácia potvrdená ✓",
  depositBody:
    "vaše lovné miesto <strong>{spot}</strong> ({range}) je pre vás <strong>predrezervované</strong>. Pre záväzné potvrdenie prosím uhraďte <strong>zálohu €{deposit} ({percent} %)</strong> do <strong>{days} dní</strong>. Zvyšok sa platí <strong>na mieste pri príchode</strong>.",
  depositRefNote:
    "<strong>Poznámka pre príjemcu:</strong> {ref}<br />Uveďte prosím presne takto, inak nevieme platbu priradiť.",
  depositWarning:
    "Upozornenie: záloha sa v žiadnom prípade nevracia. Ak záloha nepríde do {days} dní, predrezervácia sa automaticky zruší a miesto sa uvoľní.",
  depositText:
    "Dobrý deň {name}, vaše miesto je predrezervované. Uhraďte prosím zálohu €{deposit} na {holder}, IBAN {iban}, BIC {bic}. Poznámka: {ref}. Termín: {deadline}. Doplatok na mieste. Záloha sa nevracia.",

  depRecSubject: "Záloha prijatá – rezervácia potvrdená",
  depRecTitle: "Záloha prijatá ✓",
  depRecBody:
    "vaša záloha za <strong>{spot}</strong> ({range}) bola prijatá. Rezervácia je teraz záväzne potvrdená.",
  depRecFinal: "<strong>Doplatok €{final}</strong> sa uhrádza <strong>na mieste pri príchode</strong>.",
  depRecText: "Dobrý deň {name}, záloha za {spot} ({range}) bola prijatá. Doplatok €{final} na mieste.",

  finReqSubject: "Doplatok k vašej rezervácii – €{final}",
  finReqTitle: "Doplatok je splatný",
  finReqBody:
    "váš príchod na <strong>{spot}</strong> dňa <strong>{start}</strong> sa blíži. Uhraďte prosím doplatok <strong>€{final}</strong>.",
  finReqText: "Dobrý deň {name}, uhraďte prosím doplatok €{final}. Poznámka: {ref}.",
  finRecSubject: "Platba v plnej výške prijatá – tešíme sa na vás",
  finRecTitle: "Všetko uhradené ✓",
  finRecBody: "váš doplatok za <strong>{spot}</strong> ({range}) bol prijatý. Tešíme sa na vašu návštevu!",
  finRecText: "Dobrý deň {name}, váš doplatok za {spot} ({range}) bol prijatý.",

  cancelSubject: "Rezervácia zrušená",
  cancelTitle: "Rezervácia zrušená",
  cancelBody:
    "vaša rezervácia na <strong>{spot}</strong> ({range}) bola zrušená. Uhradená záloha sa podľa našich podmienok nevracia.",
  cancelText: "Dobrý deň {name}, rezervácia na {spot} ({range}) bola zrušená. Záloha prepadá.",
  noShowBody:
    "vaša rezervácia na <strong>{spot}</strong> ({range}) bola zrušená, pretože doplatok nebol uhradený na mieste. Záloha prepadá.",

  expiredSubject: "Lehota na platbu uplynula",
  expiredTitle: "Lehota na platbu uplynula",
  expiredBody:
    "vaša predrezervácia na <strong>{spot}</strong> ({range}) nebola uhradená včas a prepadla. Miesto bolo opäť uvoľnené.",
  expiredHint: "Novú rezerváciu môžete kedykoľvek vytvoriť znova.",
  expiredText: "Dobrý deň {name}, lehota na platbu za {spot} ({range}) uplynula.",

  paidSubject: "Platba potvrdená – rezervácia zaistená",
  paidTitle: "Platba prijatá ✓",
  paidBody:
    "ďakujeme! Prijali sme vašu platbu za <strong>{spot}</strong> ({range}). Rezervácia je záväzne potvrdená.",
  paidText: "Dobrý deň {name}, prijali sme vašu platbu za {spot} ({range}).",
  approvedSubject: "Vaša rezervácia bola potvrdená",
  approvedTitle: "Rezervácia potvrdená ✓",
  approvedBody: "s radosťou potvrdzujeme vašu rezerváciu na <strong>{spot}</strong>.",
  approvedText: "Dobrý deň {name}, vaša rezervácia na {spot} ({range}) bola potvrdená.",
  payNowSubject: "Vaša rezervácia bola schválená – zaplaťte prosím",
  payNowTitle: "Rezervácia schválená ✓",
  payNowBody:
    "vaša požiadavka na <strong>{spot}</strong> ({range}) bola schválená. Dokončite prosím rezerváciu platbou.",
  payNowCta: "Zaplatiť bezpečne",
  payNowFallback: "Ak tlačidlo nefunguje, otvorte tento odkaz:",
  payNowText: "Dobrý deň {name}, rezervácia na {spot} ({range}) bola schválená: {url}",
  rejectedSubject: "Informácia k vašej požiadavke",
  rejectedTitle: "Požiadavku nie je možné potvrdiť",
  rejectedBody:
    "bohužiaľ nemôžeme potvrdiť vašu požiadavku na <strong>{spot}</strong> v termíne <strong>{range}</strong>.",
  rejectedHint: "Ak zvažujete iné termíny, ozvite sa nám prosím.",
  rejectedText: "Dobrý deň {name}, požiadavku na {spot} ({range}) nemôžeme potvrdiť.",
  receivedSubject: "Prijali sme vašu požiadavku",
  receivedTitle: "Požiadavka prijatá",
  receivedBody:
    "ďakujeme za požiadavku na <strong>{spot}</strong> v termíne <strong>{range}</strong>. Čoskoro sa vám ozveme.",
  receivedText: "Dobrý deň {name}, prijali sme vašu požiadavku na {spot} ({range}).",
  refundedSubject: "Vrátenie platby spracované",
  refundedTitle: "Vrátenie platby spracované",
  refundedBody: "vaša rezervácia na <strong>{spot}</strong> ({range}) bola zrušená a suma vrátená.",
  refundedText: "Dobrý deň {name}, suma za rezerváciu {spot} ({range}) bola vrátená.",
};

const DICTS: Record<Lang, Dict> = { de, en, cs, sk };

export const translator = (lang: Lang) => (key: string, vars: Record<string, string | number> = {}) => {
  const raw = DICTS[lang][key] ?? DICTS.de[key] ?? key;
  return raw.replace(/\{(\w+)\}/g, (_m, k) => String(vars[k] ?? ""));
};

export type T = ReturnType<typeof translator>;
