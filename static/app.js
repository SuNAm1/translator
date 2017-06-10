// clipboard
new Clipboard('.clipboard-btn');

function startOneCommandArtyom() {
    artyom.fatality(); // use this to stop any of
    setTimeout(() => { // if you use artyom.fatality , wait 250 ms to initialize again.
        artyom.initialize({
            lang: "en-GB", // A lot of languages are supported. Read the docs !
            continuous: false, // recognize 1 command and stop listening !
            listen: true, // Start recognizing
            debug: true, // Show everything in the console
            speed: 1 // talk normally
        }).then(() => {
            console.log("Ready to work !");
        });
    }, 250);
}

const speechCommands = [{
        indexes: ["hello", "good morning", "good evening"],
        action() {
            artyom.say("Hey Robert! How are you today?");
        }
    }

];

artyom.addCommands(speechCommands); // Add the command with addCommands method. Now

function startArtyom() {
    artyom.initialize({
        lang: "en-GB", // A lot of languages are supported. Read the docs !
        continuous: false, // recognize 1 command and stop listening !
        listen: true, // Start recognizing
        debug: true, // Show everything in the console
        speed: 1 // talk normally
    })
}


const translatorApp = new Vue({
    el: "#translatorApp",
    data: {
        loader: false,
        snackbar: false,
        snackbar_msg: null,
        languages: [],
        selected_language: "en",
        text_to_translate: null,
        translated_text: null,
        image_url: null,
        img_dialog: false,
        image_url_field: true,
        spinner: false,
        convert_button: false,
        info: true,
        translated_text_title: "Translated Text",
        endpoint: "https://translate.yandex.net",
        yandex_api_key: "trnsl.1.1.20170609T083328Z.bc764b99ad68e76a.6e5983803d01cb65a2b4bbfa1b2cfd872599d055"
    },
    created() {
        this.fetchLanguages()
    },
    methods: {
        translate() {
            const self = this;
            if(!this.text_to_translate) return false
            this.translated_text_title = "Translating..."
            this.loader = true
            axios.get(`${this.endpoint}/api/v1.5/tr.json/translate?key=${this.yandex_api_key}&text=${this.text_to_translate}&lang=${this.selected_language}`).then(response => {
                self.translated_text_title = "Translated Text"
                self.loader = false
                self.translated_text = response.data.text[0]
                console.log(response.data)
            }).catch(function (err) {
                this.snackbar_msg = "An error occured. Check the console."
                this.snackbar = true
                console.log(err)
            })
        },
        fetchLanguages() {
            const self = this;
            axios.get(`${this.endpoint}/api/v1.5/tr.json/getLangs?ui=en&key=${this.yandex_api_key}`).then(response => {
                const languages = Object.keys(response.data.langs).map(key => ({
                    'code': key,
                    'lang': response.data.langs[key]
                }));
                self.languages = languages
                self.snackbar_msg = "Languages loaded"
                self.snackbar = true
            }).catch(err => {
                console.log(err)
            })
        },
        startListening() {
            const self = this;
            this.snackbar_msg = "Microphone on"
            this.snackbar = true
            startOneCommandArtyom()
            artyom.redirectRecognizedTextOutput((recognized, isFinal) => {
                if (isFinal) {
                    self.text_to_translate = recognized
                } else {
                    self.text_to_translate = "Recognizing..."
                }
            });
        },
        setLanguage(code) {
            this.selected_language = code
            this.snackbar_msg = `Language set to ${code}`
            this.snackbar = true
        },
        listen() {
            const self = this;
            const selected_language = this.selected_language;
            let lang = null;
            if(selected_language == "en") {
                lang = "en-GB"
            }
            else if(selected_language == "ru") {
                lang = "ru-RU"
            }
            else if(selected_language == "ja") {
                lang = "ja-JP"
            }
            else if(selected_language == "nl") {
                lang = "nl-NL"
            }
            else if(selected_language == "id") {
                lang = "id-ID"
            }
            else if(selected_language == "pl") {
                lang = "pl-PL"
            }
            else if(selected_language == "zh") {
                lang = "zh-CN"
            }
            else if(selected_language == "pt") {
                lang = "pt-PT"
            }
            else if(selected_language == "it") {
                lang = "it-IT"
            }
            else if(selected_language == "fr") {
                lang = "fr-FR"
            }
            else {
                const text = "Sorry. That language is not yet supported.";
                this.snackbar_msg = text
                this.snackbar = true
                artyom.say(text);
                return false
            }
            artyom.initialize({
                lang, // A lot of languages are supported. Read the docs !
                continuous: false, // recognize 1 command and stop listening !
                listen: false, // Start recognizing
                debug: true, // Show everything in the console
            }).then(() => {
                artyom.say(self.translated_text);
                artyom.fatality();
            });
        },
        copied() {
            this.snackbar_msg = "Copied to clipboard"
            this.snackbar = true
        },
        detectImage() {
            const self = this;
            if (!this.image_url) return false
            this.snackbar_msg = "Converting. Please wait..."
            this.snackbar = true
            this.image_url_field = false
            this.spinner = true
            this.convert_button = true
            Tesseract.recognize(this.image_url)
                .then(result => {
                    console.log(result)
                    self.snackbar_msg = "Converted"
                    self.snackbar = true
                    self.image_url_field = true
                    self.spinner = false
                    self.convert_button = false
                    self.image_url = null
                    self.text_to_translate = result.text
                })
        }
    }
});