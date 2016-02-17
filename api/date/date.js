var DATE = API.DATE = new function() {

    var enMonths = [
        'jan', 'feb', 'mar',
        'apr', 'may', 'jun',
        'jul', 'aug', 'sep',
        'oct', 'nov', 'dec'
    ];

    var relTime = [
        TIME.second,
        TIME.minute,
        TIME.hour,
        TIME.day,
        TIME.week,
        TIME.month,
        TIME.year
    ];

    this.parse = function(date) {
        if ( _.ifString(date) ) {
            var value = date.normalize().toLowerCase();

            switch ( value ) {
                case 'never':
                case 'никогда':
                    return TIME.never;
                case 'online':
                case 'только что':
                    return new Date();
            }

            value = value.replace(/(\d+\s*)г\./gi, '$1 ').replace(/\s+в\s+/gi, ' ')
                .replace(/сегодн€|вчера/gi, function replacer(str) {
                    return (str == 'сегодн€') ? new Date().toDateString() : new Date(new Date() - TIME.day).toDateString();
                })
                .replace(/(одну|один)|(две|два)|(три)|(четыре)|(п€ть)|(шесть)|(семь)|(восемь)|(дев€ть)|(дес€ть)/i, function(str) {
                    for ( var i = 1; i <= 10; i++ ) {
                        if ( arguments[i] ) {
                            return i;
                        }
                    }
                    return str;
                });

            var relative = /((\d+)\s+)?((секунду|секунды|секунд)|(минуту|минуты|минут)|(часа|часов|час)|(дн€|дней|день)|(недели|недель|недел€)|(мес€ца|мес€цев|мес€ц)|(года|лет|год))(\s+назад)?/i.exec(value);
            // [совпадение, number_space, number_точно, мера, сек, мин, час, ..., назад, индекс, полна€ строка]
            if ( _.isArray(relative) ) {
                var number = relative[2] || 1;
                for ( var i = 4; i <= 10; i++ ) {
                    if ( relative[i] ) {
                        return new Date(new Date() - relTime[i - 4] * number);
                    }
                }
            }

            value = value.replace(/(\s|^)((€нварь|€нвар€|€нв)|(февраль|феврал€|фев)|(марта|март|мар)|(апрель|апрел€|апр)|(май|ма€)|(июнь|июн€|июн)|(июль|июл€|июл)|(августа|август|авг)|(сент€брь|сент€бр€|сен)|(окт€брь|окт€бр€|окт)|(но€брь|но€бр€|но€)|(декабрь|декабр€|дек))(\s|\.|$)/i, function(str) {
                for ( var i = 3; i <= 15; i++ ) {
                    if ( arguments[i] ) {
                        return arguments[1] + enMonths[i - 3] + ' ';
                    }
                }
                return str;
            });

            var result = new Date(Date.parse(value));
            if ( isNaN(result.valueOf()) ) {
                throw new Error('Error date.parse in DATE.parse function: "' + date + '" > "' + value + '"');
            }

            if ( !/(^|\s)(19|20)\d{2}(\s|$)/.test(value) ) {
                var now  = new Date(),
                    year = now.getFullYear();
                result.setFullYear(year);
                if ( result > now ) {
                    result.setFullYear(year - 1);
                }
            }
            return result;
        }
        return null;
    }.try(null);

    // -----------------------------------------------------------------------------------------------------------------

    this.yearsLabel = function(years) {
        var tail = String(years).slice(-1);
        return tail ? (years + ' ' + (((tail = Number(tail)) == 1) ? 'год' : ((tail > 1 && tail < 5) ? 'года' : 'лет'))) : '';
    }.try('');

    this.age = function(birth) {
        if ( birth ) {
            var now = new Date();
            if ( now.getFullYear() > ((birth = new Date(birth)).getFullYear() + 1) ) {
                return (new Date(now - birth).getFullYear() - 1970);
            }
        }
        return null;
    }.try(null);

    // -----------------------------------------------------------------------------------------------------------------

    this.colorAge = function(age) {
        return age ? API.colorWeight((1 - Math.min(1, Math.abs(25 - Math.min(Math.max(age, 20), 30)) / 6)) * 0.9) : '';
    }.try('');

};

