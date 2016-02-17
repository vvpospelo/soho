STR.regexp.cyrillic_chars = XRegExp('\\p{InCyrillic}', 'gim');

STR.cyrillic = {

    map : {
        // http://unicode-table.com/ru/
        // gist.github.com/sgmurphy/3095196
        // Russian
        'а' : 'a', 'б' : 'b', 'в' : 'v', 'г' : 'g', 'д' : 'd', 'е' : 'e', 'ё' : 'e', 'ж' : 'zh',
        'з' : 'z', 'и' : 'i', 'й' : 'j', 'к' : 'k', 'л' : 'l', 'м' : 'm', 'н' : 'n', 'о' : 'o',
        'п' : 'p', 'р' : 'r', 'с' : 's', 'т' : 't', 'у' : 'u', 'ф' : 'f', 'х' : 'h', 'ц' : 'ts',
        'ч' : 'ch', 'ш' : 'sh', 'щ' : 'sh', 'ъ' : '', 'ы' : 'y', 'ь' : '', 'э' : 'e', 'ю' : 'ju',
        'я' : 'ja',
        // Ukrainian
        'є' : 'e', 'і' : 'i', 'ї' : 'i', 'ґ' : 'g',
        // Belarusian
        'ў' : 'v'
    }

};

// ---------------------------------------------------------------------------------------------------------------------

STR.translit = function(str) {
    return STR.greek.to_latin(STR.diacritics.remove(str.toLowerCase())).replace(/[\'\"]/gim, '')
        .replace(STR.regexp.cyrillic_chars, function(char) {
            return STR.cyrillic.map[char] || char;
        });
}.try('');

// ---------------------------------------------------------------------------------------------------------------------

var WORD = API.WORD = {
    regexp : {}
};

WORD.first = function(value) {
    return _.isNumeric(value) ? String(value) : (String(value).match(/[а-яёє-їґ\w]+/i) || [])[0];
};

WORD.mTails = function(word) { // приведение условных окончаний возможных мужских имен
    return word.replace(/([^aeiouy])(ey|ej|ei|ii|iy|ij|yy|yj|yi)$/gi, '$1ij')
        .replace(/([^aeiouy])(ay|ai)$/gi, '$1aj')
        .replace(/([^aeiouy])(i)$/gi, '$1y')
        .replace(/([^aeiouy])er$/gi, '$1r');
}.try('');

WORD.noDups = function(word) { // удаление повторяющихся символов
    return word.replace(/([^h])\1+/gi, '$1');
}.try('');

WORD.softNorm = function(word) { // приведение мягкого-твердого знака и апострофа
    return word.replace(/['](?=[aeiouy])/gi, 'j')
        .replace(/[']/gi, '')
        .replace(/[\W]/gi, '');
}.try('');

WORD.dupCons = function(word) { // приведение двойных согласных
    return word.replace(/ck/gi, 'k').replace(/kh/gi, 'h')
        .replace(/[c](?![hiy])/gi, 'k')
        .replace(/ks/gi, 'x').replace(/xs/gi, 'x')
        .replace(/th/gi, 't')
        .replace(/ph/gi, 'f');
}.try('');

WORD.jyiNorm = function(word) { // приведение [jyi]
    return word.replace(/^[jyi](?=[o])/gi, 'i').replace(/[j][o]/gi, 'e')
        .replace(/^[jyi](?=[ei])/gi, '')
        .replace(/[jy](?=\w)/gi, 'i');
}.try('');

WORD.wNorm = function(word) { // приведение w
    return word.replace(/[w](?=\w)/gi, 'v');
}.try('');

// ---------------------------------------------------------------------------------------------------------------------

WORD.make_pattern = function(word) { // важен порядок !!!
    return WORD.noDups(WORD.wNorm(WORD.jyiNorm(WORD.dupCons(WORD.softNorm(WORD.noDups(WORD.mTails(STR.translit(word))))))));
}.try('');

// ---------------------------------------------------------------------------------------------------------------------

WORD.regexp.separator = XRegExp('[\\p{P}\\s]', '');

WORD.regexp.business_names = RegExp('^deleted$|(^|\\W)(\
 gar(e|)derob|tatuazh|odezhd(a|y)|prodazha|shop|fotograf(|r|y)|klub|\
 fashion|model(|s)|dj|odiag|makiazh|(tur|)agen(t|)(stvo|cy)|studi(a|o)|\
 salon|prodam|kosmet(ika|ix|olog(|y))|nedorogo|sale|magazin(e|)|plati(e|a)|\
 shoping|belie|zhurnal|pokupky|design(|r)|butik|axesuary|meikap|\
 proiect|arenda|narash(h|)ivanie|(bio|d|)epiliatsia|pricheski|piling|\
 dostavka|tovari|akesories|pechat|bizhuteria|parfium(eria|y)|odezhk(a|i)|\
 zagar|parfum(r|s|)|boutique|foto(studio|sesia)|klotes|market|pitstseria|\
 vizazh(|ist)|stilist|fotostud(ia|io)|strizhky|ko(m|mm)(o|i)sionka|dekupazh|\
 ekonomia|tvorchestv(a|o)|rabot(a|y)|exkliuziv(|nie)|katalog(y|)|zakaz(y|)|\
 prazdnik(y|)|technology|luchshie|izdelia|eivon|putev(och|)ky|otkritky|\
 group|dizain|nakleiky|chehly|(telefon|planshet)(y|ov)|(video)|tehnik(a|y)|\
 (kruglosutochn|svadebn|modn|stiln|iuvelirn|brendov|textiln)(o|oe|ie|ij|aia)|\
 tur(izm|operator)|podar(ky|ochky)|oformlenie|manikiur|poehaly|puteshestvia\
 )(\\W|$)'.normalize().replace(/\s/gim, ''), 'i'); // only i, not g

WORD.regexp.married_name = /\s*(\(.*\))\s*$/i;

WORD.regexp.v_names = /(^|\W)([vwe]|ler|tor|nik|zhe|kat|len|bar|alen|lel|tin|lui|liz|[z](?=[aeiouy])|[jyi](?=[ae]))/i;

String.prototype.like = function(pattern) {
    var pieces = this.normalize().split(WORD.regexp.separator) || [];
    for ( var i = 0; i < pieces.length; i++ ) {
        if ( pattern.test(WORD.make_pattern(pieces[i])) ) {
            return true;
        }
    }
    return false;
}.try(false);

// ---------------------------------------------------------------------------------------------------------------------

String.prototype.normalize = function() {
    return STR.unslash(this).replace(STR.regexp.invisibleChars, ' ').replace(/\s\s+/gm, ' ').trim();
};

String.prototype.capitalize = function() {
    return this.toLowerCase().replace(/^.|\s\S/g, function(a) {
        return a.toUpperCase();
    });
};

// ---------------------------------------------------------------------------------------------------------------------

$('body').on('change', '#search_query', function() {
    var input = $(this).val() || '';
    _.log('"' + input + '"', ' > ', '"' + WORD.make_pattern(input) + '"', ' > ', input.like(WORD.regexp.business_names));
});
