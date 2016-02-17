// http://en.wikipedia.org/wiki/Romanization_of_Greek

STR.regexp.greek_chars = XRegExp('\\p{InGreek_and_Coptic}', 'gim');

STR.greek = {

    map : {
        0x0386 : 'A', 0x0388 : 'E', 0x0389 : 'H', 0x038A : 'I', 0x038C : 'O', 0x038E : 'Y',
        0x038F : 'O', 0x0390 : 'i', 0x0391 : 'A', 0x0392 : 'B', 0x0393 : 'G', 0x0394 : 'D',
        0x0395 : 'E', 0x0396 : 'Z', 0x0397 : 'H', 0x0398 : '8', 0x0399 : 'I', 0x039A : 'K',
        0x039B : 'L', 0x039C : 'M', 0x039D : 'N', 0x039E : '3', 0x039F : 'O', 0x03A0 : 'P',
        0x03A1 : 'R', 0x03A3 : 'S', 0x03A4 : 'T', 0x03A5 : 'Y', 0x03A6 : 'F', 0x03A7 : 'X',
        0x03A8 : 'Y', 0x03A9 : 'O', 0x03AA : 'I', 0x03AB : 'Y',
        0x03AC : 'a', 0x03AD : 'e', 0x03AE : 'h', 0x03AF : 'i', 0x03B0 : 'u', 0x03B1 : 'a',
        0x03B2 : 'b', 0x03B3 : 'y', 0x03B4 : 'd', 0x03B5 : 'e', 0x03B6 : 'z', 0x03B7 : 'h',
        0x03B8 : '8', 0x03B9 : 'i', 0x03BA : 'k', 0x03BB : 'l', 0x03BC : 'm', 0x03BD : 'v',
        0x03BE : '3', 0x03BF : 'o', 0x03C0 : 'p', 0x03C1 : 'r', 0x03C2 : 's', 0x03C3 : 'o',
        0x03C4 : 't', 0x03C5 : 'u', 0x03C6 : 'f', 0x03C7 : 'x', 0x03C8 : 'y', 0x03C9 : 'w',
        0x03CA : 'i', 0x03CB : 'u', 0x03CC : 'o', 0x03CD : 'u', 0x03CE : 'w'
    },

    to_latin : function(str) {
        return str.replace(STR.regexp.greek_chars, function(char) {
            return STR.greek.map[parseInt(String(char).charCodeAt(0))] || char;
        })
    }

};

