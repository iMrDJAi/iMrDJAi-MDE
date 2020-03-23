(function () {
    window.mrdjaMDE = function (taSelector, buttons) {
        /***************************************************************************\
        *******************************Main functions********************************
        \***************************************************************************/
        //Dependencies
        var txtHistory = window.UndoRedojs(5); //UndoRedo.js
        var renderMarkdown = window.renderMarkdown; //Markdown renderer

        //The system object
        var mrdjaMDE = {};

        //The default buttons
        mrdjaMDE.defaultButtonsObj = [{
            name: "undo",
            icon: "&#xF54C;",
            css_class: "markdown-editor-button",
            action: undo,
        },
        {
            name: "redo",
            icon: "&#xF44E;",
            css_class: "markdown-editor-button",
            action: redo,
        },
        {
            icon: "&#xF374",
            css_class: "markdown-editor-separator",
            type: "separator"
        },
        {
            name: "bold",
            icon: "&#xF264;",
            css_class: "markdown-editor-button",
            action: bold,
        },
        {
            name: "italic",
            icon: "&#xF277;",
            css_class: "markdown-editor-button",
            action: italic,
        },
        {
            name: "underline",
            icon: "&#xF287;",
            css_class: "markdown-editor-button",
            action: underline,
        },
        {
            name: "strikethrough",
            icon: "&#xF281;",
            css_class: "markdown-editor-button",
            action: strikethrough,
        },
        {
            name: "supscript",
            icon: "&#xF283;",
            css_class: "markdown-editor-button",
            action: supscript,
        },
        {
            name: "subscript",
            icon: "&#xF282;",
            css_class: "markdown-editor-button",
            action: subscript,
        },
        {
            icon: "&#xF374",
            css_class: "markdown-editor-separator",
            type: "separator"
        },
        {
            name: "heading",
            icon: "&#xF274;",
            css_class: "markdown-editor-button",
            action: heading,
        },
        {
            name: "quote",
            icon: "&#xF756;",
            css_class: "markdown-editor-button",
            action: quote,
        },
        {
            name: "spoiler",
            icon: "&#xF026;",
            css_class: "markdown-editor-button",
            action: spoiler,
        },
        {
            name: "inline code",
            icon: "&#xF174;",
            css_class: "markdown-editor-button",
            action: inlineCode,
        },
        {
            name: "code block",
            icon: "&#xF169;",
            css_class: "markdown-editor-button",
            action: codeBlock,
        },
        {
            icon: "&#xF374",
            css_class: "markdown-editor-separator",
            type: "separator"
        },
        {
            name: "ordered list",
            icon: "&#xF27B;",
            css_class: "markdown-editor-button",
            action: orderedList,
        },
        {
            name: "unordered list",
            icon: "&#xF279;",
            css_class: "markdown-editor-button",
            action: unorderedList,
        },
        {
            name: "table",
            icon: "&#xF4EB;",
            css_class: "markdown-editor-button",
            action: table,
        },
        {
            icon: "&#xF374",
            css_class: "markdown-editor-separator",
            type: "separator"
        },
        {
            name: "link",
            icon: "&#xF339;",
            css_class: "markdown-editor-button",
            action: link,
        },
        {
            name: "image",
            icon: "&#xF2E9;",
            css_class: "markdown-editor-button",
            action: image,
        },
        {
            icon: "&#xF374",
            css_class: "markdown-editor-separator",
            type: "separator"
        },
        {
            name: "resize",
            icon: "&#xFE91;",
            css_class: "markdown-editor-button",
            action: resize,
        },
        {
            name: "help",
            icon: "&#xF2D7;",
            css_class: "markdown-editor-button",
            action: help,
        }
        ];

        //The main function
        (function () { //Usage example: createMDE("#input", buttons);
            if (!buttons) buttons = mrdjaMDE.defaultButtonsObj; //Use the default buttons if the user didn't customize them
            //ta needs a check! 

            const ta = document.querySelector(taSelector); //Get the textarea element
            mrdjaMDE.txtarea = ta; //Export the textarea outside the main function

            //Create the editor element
            const mde = document.createElement("div"); //Create the div
            mrdjaMDE.mde = mde;
            ta.parentNode.insertBefore(mde, ta); //Insert the div before the textarea
            mde.classList.add("markdown-editor"); //Add the editor css class

            //Create the toolbar element
            const toolbar = document.createElement("div");
            mde.appendChild(toolbar);
            toolbar.classList.add("markdown-editor-toolbar");
            //Working with the toolbar content
            for (let button of buttons) {
                if (button.type !== 'separator') { //Create the buttons
                    const btn = document.createElement("button");
                    toolbar.appendChild(btn);
                    btn.title = button.name;
                    btn.innerHTML = button.icon;
                    btn.classList.add(button.css_class);
                    btn.addEventListener("click", function (e) {
                        button.action();
                    });
                }
                if (button.type === 'separator') { //Create the separators
                    const sep = document.createElement("button");
                    toolbar.appendChild(sep);
                    sep.innerHTML = button.icon;
                    sep.classList.add(button.css_class);
                }
            }

            //Create the body element
            const body = document.createElement("div");
            mde.appendChild(body);
            body.classList.add("markdown-editor-body");

            body.appendChild(ta);
            ta.classList.add("markdown-editor-ta");

            //Create the preview element
            const prev = document.createElement("div");
            mrdjaMDE.preview = prev;
            body.appendChild(prev);
            prev.classList.add("markdown-editor-preview");

            //Spliter function
            mrdjaMDE.split = Split([ta, prev], {
                sizes: [100, 0],
                minSize: [0, 0],
            });
            mrdjaMDE.split.pairs[0].gutter.innerHTML = "&#xFE91;";

            //Textarea input event
            ta.addEventListener('input', () => {
                if ((ta.value.length - txtHistory.current().length) > 1 || (ta.value.length - txtHistory.current().length) < -1) {
                    txtHistory.record(ta.value, true);
                } else {
                    txtHistory.record(ta.value);
                }
                previewUpdate();
            });
            //Note: some browsers will auto-fill the textarea again after reloading, this will catch that text
            setTimeout(() => {
                if (ta.value) previewUpdateAndRecord();
            }, 100);
        })();
        /***************************************************************************\
        *****************************************************************************
        \***************************************************************************/


        /***************************************************************************\
        ******************************Buttons functions******************************
        \***************************************************************************/
        function undo() {
            if (mrdjaMDE.isHelp === false) {
                const txtundo = txtHistory.undo();
                if (txtundo !== undefined) {
                    mrdjaMDE.txtarea.value = txtundo;
                    previewUpdate();
                }
            }
        }

        function redo() {
            if (mrdjaMDE.isHelp === false) {
                const txtredo = txtHistory.redo();
                if (txtredo !== undefined) {
                    mrdjaMDE.txtarea.value = txtredo;
                    previewUpdate();
                }
            }
        }

        function bold() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '****' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 2;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '**' + text + '**' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 2;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function italic() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '**' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 1;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '*' + text + '*' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 1;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function underline() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '++++' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 2;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '++' + text + '++' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 2;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function strikethrough() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '~~~~' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 2;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '~~' + text + '~~' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 2;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function supscript() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '^()' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 2;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '^(' + text + ')' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 2;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function subscript() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '~()' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 2;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '~(' + text + ')' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 2;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function heading() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    if (/(\n)[\#]{1,5}(\s)$/.test(before)) {
                        before = before.substring(0, selstart - 1);
                        mrdjaMDE.txtarea.value = before + '# ' + after;
                        mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 1;
                        mrdjaMDE.txtarea.focus();
                        previewUpdateAndRecord();
                    } else if (/(\n)[\#]{6,}(\s)$/.test(before)) {
                        before = before.replace(/(\n)[\#]{6,}(\s)$/, '');
                        mrdjaMDE.txtarea.value = before + '\n# ' + after;
                        mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = before.length + 3;
                        mrdjaMDE.txtarea.focus();
                        previewUpdateAndRecord();
                    } else {
                        mrdjaMDE.txtarea.value = before + '\n# ' + after;
                        mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 3;
                        mrdjaMDE.txtarea.focus();
                        previewUpdateAndRecord();
                    }
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '\n# ' + text + '\n' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 3;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function quote() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    if (/(\n)(>)+$/.test(before)) {
                        mrdjaMDE.txtarea.value = before + '>' + after;
                        mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 1;
                        mrdjaMDE.txtarea.focus();
                        previewUpdateAndRecord();
                    } else {
                        mrdjaMDE.txtarea.value = before + '\n>' + after;
                        mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 2;
                        mrdjaMDE.txtarea.focus();
                        previewUpdateAndRecord();
                    }
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '\n>' + text + '\n\n' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 2;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function spoiler() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '>!!<' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 2;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '>!' + text + '!<' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 2;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function inlineCode() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '``' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 1;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '`' + text + '`' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 1;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function codeBlock() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '\n```lang\n\n```\n' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 9;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '\n```lang\n' + text + '\n```\n' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 9;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function orderedList() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '\n1. ' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 4;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '\n1. ' + text + '\n' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 4;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function unorderedList() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '\n- ' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + 3;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '\n- ' + text + '\n' + after;
                    mrdjaMDE.txtarea.selectionStart = mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 3;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function table() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '\n| 01 | 02 | 03 | 04 |\n|:--:|:--:|:--:|:--:|\n| 05 | 06 | 07 | 08 |\n| 09 | 10 | 11 | 12 |\n' + after;
                    mrdjaMDE.txtarea.selectionStart = selstart + 3;
                    mrdjaMDE.txtarea.selectionEnd = selstart + 5;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                } else {
                    var before = txt.substring(0, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '\n| 01 | 02 | 03 | 04 |\n|:--:|:--:|:--:|:--:|\n| 05 | 06 | 07 | 08 |\n| 09 | 10 | 11 | 12 |\n' + after;
                    mrdjaMDE.txtarea.selectionStart = selend + 3;
                    mrdjaMDE.txtarea.selectionEnd = selend + 5;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function link() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '[link](https://www.example.com "link")' + after;
                    mrdjaMDE.txtarea.selectionStart = selstart + 7;
                    mrdjaMDE.txtarea.selectionEnd = selstart + 30;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '[' + text + '](https://www.example.com "link")' + after;
                    mrdjaMDE.txtarea.selectionStart = selstart + text.length + 3;
                    mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 26;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function image() {
            if (mrdjaMDE.isHelp === false) {
                var selstart = mrdjaMDE.txtarea.selectionStart;
                var selend = mrdjaMDE.txtarea.selectionEnd;
                var txt = mrdjaMDE.txtarea.value;
                if (selstart === selend) {
                    var before = txt.substring(0, selstart);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '![image](https://www.example.com "image")' + after;
                    mrdjaMDE.txtarea.selectionStart = selstart + 9;
                    mrdjaMDE.txtarea.selectionEnd = selstart + 32;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                } else {
                    var before = txt.substring(0, selstart);
                    var text = txt.substring(selstart, selend);
                    var after = txt.substring(selend, txt.length);
                    mrdjaMDE.txtarea.value = before + '![' + text + '](https://www.example.com "image")' + after;
                    mrdjaMDE.txtarea.selectionStart = selstart + text.length + 4;
                    mrdjaMDE.txtarea.selectionEnd = selstart + text.length + 27;
                    mrdjaMDE.txtarea.focus();
                    previewUpdateAndRecord();
                }
            }
        }

        function resize() {
            if (mrdjaMDE.split.getSizes()[0] > 50) {
                mrdjaMDE.split.setSizes([50, 50]);
            } else if (mrdjaMDE.split.getSizes()[0] <= 50 && mrdjaMDE.split.getSizes()[0] > 2) {
                mrdjaMDE.split.setSizes([0, 100]);
            } else if (mrdjaMDE.split.getSizes()[0] <= 2) {
                mrdjaMDE.split.setSizes([100, 0]);
            }
        }

        //For the help function
        mrdjaMDE.isHelp = false;
        mrdjaMDE.txtBackup = '';

        function help() {
            if (mrdjaMDE.isHelp === false) {
                if (mrdjaMDE.txtarea.value !== null) mrdjaMDE.txtBackup = mrdjaMDE.txtarea.value;
                var helptxt = "****\n# ${Mr.DJA} Markdown Editor\n****\n\n>**bold**\n>*italic*\n>++underline++\n>~~strickthrough~~\n\n># h1\n>## h2\n>### h3\n>#### h4\n>##### h5\n>###### h6\n\n>> ..........\n>> quote\n>> ..........\n\n>`inline code`\n\n>```js\n>//code block\n>code(\"block\");\n>function code(block) {\n>   console.log(`code ${block}`);\n>}\n>```\n\n> ordered list\n> 1. one.\n> 1. two.\n> 2. three.\n> 13. four.\n> 2002. five.\n\n> unordered list\n> - foo.\n> - doo.\n> - bar.\n> - baz.\n\n> table\n> | 01 | 02 | 03 | 04 |\n> |:--:|:--:|:--:|:--:|\n> | 05 | 06 | 07 | 08 |\n> | 09 | 10 | 11 | 12 |\n\n> [link](https://invite.gg/mrdjaMDE \"link\")\n\n> image\n> ![image](../assets/media/img.gif \"image\")";
                mrdjaMDE.txtarea.value = helptxt;
                mrdjaMDE.isHelp = true;
                mrdjaMDE.txtarea.readOnly = true;
                mrdjaMDE.split.setSizes([50, 50]);
            } else if (mrdjaMDE.isHelp === true) {
                mrdjaMDE.txtarea.value = mrdjaMDE.txtBackup;
                mrdjaMDE.isHelp = false;
                mrdjaMDE.txtarea.readOnly = false;
            }
            previewUpdate();
        }
        /***************************************************************************\
        *****************************************************************************
        \***************************************************************************/


        /***************************************************************************\
        **********************************Markdown***********************************
        \***************************************************************************/
        function previewUpdate() {
            mrdjaMDE.preview.innerHTML = renderMarkdown(mrdjaMDE.txtarea.value);
        }

        function previewUpdateAndRecord() {
            txtHistory.record(mrdjaMDE.txtarea.value, true);
            mrdjaMDE.preview.innerHTML = renderMarkdown(mrdjaMDE.txtarea.value);
        }
        /***************************************************************************\
        *****************************************************************************
        \***************************************************************************/
        return mrdjaMDE;
    }
})();
