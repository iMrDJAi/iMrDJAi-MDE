//window.renderMarkdown
(window.renderMarkdown = function (text) {
    text = text || '';
    
    text = text.replace(/(\[(.*?)\]\(https:\/\/preview\.redd\.it\/[\S]+?\.[\S]+?\?[\S]+?\))|(\[(.*?)\]\(https:\/\/reddit\.com\/link\/[\S]+?\/video\/[\S]+?\/player\))/g, function(wm){
        return '!' + wm;
    });

    let env = {};
    window.markdownit('zero').enable('reference').parse(text, env);

    var fullRender = window.markdownit({
            linkify: true,
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return '<pre class="hljs"><code>' +
                            hljs.highlight(lang, str, true).value +
                            '</code></pre>';
                    } catch (__) {}
                }
                return '<pre class="hljs"><code>' + fullRender.utils.escapeHtml(str) + '</code></pre>';
            }
        }).use(window.markdownitIns).use(markdownitSpoiler()).use(markdownitSupSubscript(0)).use(markdownitSupSubscript(1)).use(markdownitSupSubscript(2));
    
    fullRender.linkify.add('/', { // /r/subreddit /u/redditor
        validate: function (text, pos, self) {
            var tail = text.slice(pos - 1);
            if (!self.re.subReddit1) self.re.subReddit1 = /^\/r\/(\w+)/;
            if (!self.re.redditor1) self.re.redditor1 = /^\/u\/(\w+)/;
            if (self.re.subReddit1.test(tail)) return tail.match(self.re.subReddit1)[0].length - 1;
            if (self.re.redditor1.test(tail)) return tail.match(self.re.redditor1)[0].length - 1;
            return 0;
        },
        normalize: function (match) {
            if (/^\/r/.test(match.url)) match.url = 'https://reddit.com' + match.url;
            if (/^\/u/.test(match.url)) match.url = 'https://reddit.com/' + match.url.replace(/^\/u/, 'user');
        }
    });

    fullRender.linkify.add('r', { // r/subreddit
        validate: function (text, pos, self) {
            var tail = text.slice(pos - 1);
            if (!self.re.subReddit2) self.re.subReddit2 = /^r\/(\w+)/;
            if (self.re.subReddit2.test(tail)) return tail.match(self.re.subReddit2)[0].length - 1;
            return 0;
        },
        normalize: function (match) {
            match.url = 'https://reddit.com/' + match.url;
        }
    });

    fullRender.linkify.add('u', { // u/redditor
        validate: function (text, pos, self) {
            var tail = text.slice(pos - 1);
            if (!self.re.redditor2) self.re.redditor2 = /^u\/(\w+)/;
            if (self.re.redditor2.test(tail)) return tail.match(self.re.redditor2)[0].length - 1;
            return 0;
        },
        normalize: function (match) {
            match.url = 'https://reddit.com/' + match.url.replace(/^u/, 'user');
        }
    });

    function inlineRenderer(type) {
        if (type === 'spoiler') {
            return window.markdownit({
                    linkify: true,
                }).disable('table').disable('list').disable('heading').disable('lheading').disable('fence').disable('blockquote').disable('code').disable('hr')
                .use(window.markdownitIns).use(markdownitSupSubscript(0)).use(markdownitSupSubscript(1)).use(markdownitSupSubscript(2));
        }
        if (type === 'supsubscript') {
            return window.markdownit({
                    linkify: true,
                }).disable('table').disable('list').disable('heading').disable('lheading').disable('fence').disable('blockquote').disable('code').disable('hr').disable('image')
                .use(window.markdownitIns);
        }
    }

    function markdownitSpoiler() { // >!spoiler!<
        return window.markdownitRegexp(
            /\>\!([\s\S]+?)\!\</,
            function (match, utils) {
                const html = inlineRenderer('spoiler').render(match[1], env);
                return `<span class="md-spoiler" title="spoiler" onclick="this.classList.add('md-unhidenspoiler')"><span>${html.replace(/\<p\>|\<\/p\>\s/g, '')}</span></span>`;
            }
        )
    }

    function markdownitSupSubscript(n) {
        if (n === 0) { //^(supscript)
            return window.markdownitRegexp(
                /\^\(((?:\[[^\]]*\]\([^)]*\)|[\s\S])+?)\)/,
                function (match, utils) {
                    const html = inlineRenderer('supsubscript').render(match[1], env);
                    return `<sup>${html.replace(/\<p\>|\<\/p\>\s/g, '')}</sup>`;
                }
            )
        }
        if (n === 1) { //~(subscript)
            return window.markdownitRegexp(
                /\~\(((?:\[[^\]]*\]\([^)]*\)|[\s\S])+?)\)/,
                function (match, utils) {
                    const html = inlineRenderer('supsubscript').render(match[1], env);
                    return `<sub>${html.replace(/\<p\>|\<\/p\>\s/g, '')}</sub>`;
                }
            )
        }
        if (n === 2) { //^supscript ~subscript
            return window.markdownitRegexp(
                /([\^|\~])((?:\[[^\]]*\]\([^)]*\)|[\S])+)/,
                function (match, utils) {
                    if (match[1] === '^') {
                        const html = inlineRenderer('supsubscript').render(match[2], env);
                        return `<sup>${html.replace(/\<p\>|\<\/p\>\s/g, '')}</sup>`;
                    }
                    if (match[1] === '~') {
                        const html = inlineRenderer('supsubscript').render(match[2], env);
                        return `<sub>${html.replace(/\<p\>|\<\/p\>\s/g, '')}</sub>`;
                    }
                }
            )
        }
    }
    return fullRender.render(text);
})();
