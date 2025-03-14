'use strict'
class HeatmapPlugin {
    _data = {};
    _options = {
        legend: true,
        timescale: true,
        range: {
            from: '#year#-01-01T00:00:00',
            till: '#year#-12-30T00:00:00',
            grade: 1,
            interval: 'day', //month, year, hours, minutes
            rows: 7,
        },
        units: 5,
    };
    _theme = {
        width: '18',
        height: '15',
        font: {
            size: '10',
            family: 'Arial',
            color: 'white'
        }
    };
    _container = null;
    ;

    /**
     * sets data, options and theme, and maybe renders the heatmap
     * @param containerId
     * @param data
     * @param options
     * @param theme
     * @param instantRender render it instant or wait for render()
     */
    constructor(containerId, data, options = {}, theme = {}, instantRender = false) {
        this._data = data;

        this.transferObject(options, this._options, 'range');
        //replace #year# with current year
        //this._options.range.from = this._options.range.from.replace(/#year#/i,new Date().getFullYear());
        //this._options.range.till = this._options.range.till.replace(/#year#/i,new Date().getFullYear());
        this.transferObject(theme, this._theme, 'font');

        this._container = window.document.getElementById(containerId);
        if ('undefined' === typeof (this._container))
            throw 'heatmap container ' + containerId + ' not found.';

        if (instantRender)
            this.render();
    }

    /**
     * transfer parameter object to class object
     * @param src object
     * @param dest object
     * @param sub string
     */
    transferObject(src, dest, sub) {
        if (src !== {}) {
            for (const [key, value] of Object.entries(src)) {
                if (key === 'colors')
                    for (const [rangeKey, rangeValue] of Object.entries(value)) {
                        dest[sub][rangeKey] = rangeValue;
                    }
                else
                    dest[key] = value;
            }
        }
    }

    makeColor(i) {
        let maxcolor = { r: 57, g: 211, b: 83 };
        let onestep = {
            r: Math.round(maxcolor.r / 10),
            g: Math.round(maxcolor.g / 10),
            b: Math.round(maxcolor.b / 10)
        }

        return {
            r: Math.min(Math.round(maxcolor.r * i / this._options.units + i * onestep.r), maxcolor.r),
            g: Math.min(Math.round(maxcolor.g * i / this._options.units + i * onestep.g), maxcolor.g),
            b: Math.min(Math.round(maxcolor.b * i / this._options.units + i * onestep.b), maxcolor.b),
        }
    }

    /**
     * renders the heatmap with given data
     */
    render() {
        //TODO: hourly produces: Uncaught InternalError: allocation size overflow
        let unit;
        let html = '';
        let current = new Date(this._options.range.from);
        let target = new Date(this._options.range.till);
        const zeroPad = (num, places) => String(num).padStart(places, '0')

        let activated = false;
        while (current < target) {
            unit = zeroPad(current.getDate(), 2) + '.' + zeroPad(current.getMonth() + 1, 2) + '.' + current.getFullYear() +
                'T' + current.getHours() + ':' + current.getMinutes() + ':' + current.getSeconds();
            if (activated || data[unit]) {
                activated = true;

                let value = data[unit];
                if (!value) {
                    value = 0;
                }

                html += '<div style="' +
                    'height: ' + this._theme.height + 'px; ' +
                    'width: ' + this._theme.width + 'px; ';

                if (value) {
                    let color = this.makeColor(value);
                    html += `background-color:rgb(${color.r}, ${color.g}, ${color.b})` + '" title="' +
                        current.toLocaleString() + ' - ' +
                        value +
                        '';
                }
                else {
                    let color = this.makeColor(0);
                    html += `background-color:rgb(${color.r}, ${color.g}, ${color.b})"`;
                }
                html += `" class="entry">${value}</div>`;
            }

            //TODO: one day is missing!
            switch (this._options.range.interval) {
                case 'day':
                    current.setDate(current.getDate() + this._options.range.grade);
                    break;
                case 'month':
                    current.setDate(current.getMonth() + this._options.range.grade);
                    break;
                case 'hours':
                    current.setDate(current.getHours() + this._options.range.grade);
                    break;
                case 'minutes':
                    current.setDate(current.getMinutes() + this._options.range.grade);
                    break;
                case 'seconds':
                    current.setDate(current.getSeconds() + this._options.range.grade);
                    break;
                default:
                    current.setDate(current.getFullYear() + this._options.range.grade);
                    break;
            }
        }
        this._container.style.height = (this._theme.height * this._options.range.rows + (2 * this._options.range.rows)) + 'px';
        this._container.innerHTML = html;
        if (this._options.legend)
            this.addLegend()
    }
    addLegend() {
        let legend = document.createElement('div');
        legend.classList.add("legend");
        let html = 'less ';
        for (let option = 0; option < this._options.units; option++) {
            html += '<div style="' +
                'height: ' + (this._theme.height / 2) + 'px; ' +
                'width: ' + (this._theme.width / 2) + 'px; ' +
                '" class="entry color-' +
                option + '"';
            html += '></div>';
        }
        html += ' many'
        legend.innerHTML = html;
        legend.style.color = this._theme.font.color;
        legend.style.fontSize = this._theme.font.size + 'px';
        legend.style.fontFamily = this._theme.font.family;
        this._container.parentNode.insertBefore(legend, this._container.nextSibling);

        //TODO: add time scale captions
    }
}