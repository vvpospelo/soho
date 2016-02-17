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
                case '�������':
                    return TIME.never;
                case 'online':
                case '������ ���':
                    return new Date();
            }

            value = value.replace(/(\d+\s*)�\./gi, '$1 ').replace(/\s+�\s+/gi, ' ')
                .replace(/�������|�����/gi, function replacer(str) {
                    return (str == '�������') ? new Date().toDateString() : new Date(new Date() - TIME.day).toDateString();
                })
                .replace(/(����|����)|(���|���)|(���)|(������)|(����)|(�����)|(����)|(������)|(������)|(������)/i, function(str) {
                    for ( var i = 1; i <= 10; i++ ) {
                        if ( arguments[i] ) {
                            return i;
                        }
                    }
                    return str;
                });

            var relative = /((\d+)\s+)?((�������|�������|������)|(������|������|�����)|(����|�����|���)|(���|����|����)|(������|������|������)|(������|�������|�����)|(����|���|���))(\s+�����)?/i.exec(value);
            // [����������, number_space, number_�����, ����, ���, ���, ���, ..., �����, ������, ������ ������]
            if ( _.isArray(relative) ) {
                var number = relative[2] || 1;
                for ( var i = 4; i <= 10; i++ ) {
                    if ( relative[i] ) {
                        return new Date(new Date() - relTime[i - 4] * number);
                    }
                }
            }

            value = value.replace(/(\s|^)((������|������|���)|(�������|�������|���)|(�����|����|���)|(������|������|���)|(���|���)|(����|����|���)|(����|����|���)|(�������|������|���)|(��������|��������|���)|(�������|�������|���)|(������|������|���)|(�������|�������|���))(\s|\.|$)/i, function(str) {
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
        return tail ? (years + ' ' + (((tail = Number(tail)) == 1) ? '���' : ((tail > 1 && tail < 5) ? '����' : '���'))) : '';
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

