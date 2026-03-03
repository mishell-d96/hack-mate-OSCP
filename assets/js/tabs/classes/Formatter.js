class Formatter {

    static formatHTML(htmlString, depth = 4) {
        return html_beautify(htmlString, { indent_size: depth });
    }

    static formatJavaScript(jsString, depth = 4) {
        return js_beautify(jsString, { indent_size: depth });
    }

    // JSON
    static isValidJSON(jsonString) {
        try {
            JSON.parse(jsonString);
            return true;
        } catch (e) {
            return false;
        }
    }

    static formatJSON(jsonString, depth = 4) {
        if (!Formatter.isValidJSON(jsonString)) {
            throw new Error('Invalid JSON string');
        }
        const jsonObject = JSON.parse(jsonString);
        return JSON.stringify(jsonObject, null, depth);
    }

    static formatCSS(cssString, depth = 4) {
        return css_beautify(cssString, { indent_size: depth });
    }

    // SQL & PostgreSQL
    static isValidSQL(sqlString) {
        return /^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE)\s+/i.test(sqlString.trim());
    }

    static formatSQL(sqlString, depth = 4) {
        if (!Formatter.isValidSQL(sqlString)) {
            throw new Error('Invalid SQL string');
        }

        const indent = ' '.repeat(depth);
        return sqlString
            .replace(/,\s*/g, ',\n' + indent)
            .replace(/\s+(FROM|WHERE|AND|OR|GROUP BY|ORDER BY|INNER JOIN|LEFT JOIN|RIGHT JOIN|ON)\s+/ig, `\n${indent}$1 `);
    }
}
