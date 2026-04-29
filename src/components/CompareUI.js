import m from "mithril";
import {
  loadModels,
  compareFaces,
  smileIntensity,
  symmetryScore,
  ageGuess,
} from "../services/faceService";

export default {
  img1: null,
  img2: null,
  results: [],
  img1Pts: 0,
  img2Pts: 0,
  doResemblance: false,
  doBillionaire: false,
  doSmile: false,
  doSymmetry: false,
  doAge: false,
  winnerMap: {},
  comparing: false,

  async oninit() {
    await loadModels();
  },

  maxString(obj) {
    const countMap = {};

    // Count occurrences of each string
    for (const key in obj) {
      const str = obj[key];
      countMap[str] = (countMap[str] || 0) + 1;
    }

    // Find the string with the maximum count
    let maxCount = 0;
    let maxString = "";

    for (const str in countMap) {
      if (countMap[str] > maxCount) {
        maxCount = countMap[str];
        maxString = str;
      }
    }

    return maxString;
  },

  fileToImage(file, assign) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this[assign] = img;
        resolve(img);
        m.redraw();
      };
      img.src = URL.createObjectURL(file);
    });
  },

  async runSelectedComparisons() {
    this.results = [];
    this.winnerMap = {};
    this.img1Pts = 0;
    this.img2Pts = 0;

    if (this.doResemblance) {
      const sim = await compareFaces(this.img1, this.img2);
      this.results.push(
        `Resemblance: ${sim ? sim.toFixed(2) + "%" : "Could not detect"}`,
      );
    }

    if (this.doBillionaire) {
      const winner = Math.random() > 0.5 ? "portrait1" : "portrait2";
      winner === "portrait1" ? this.img1Pts++ : this.img2Pts++;
      this.results.push(
        `Billionaire vibe: ${winner === "portrait1" ? "Portrait 1" : "Portrait 2"}`,
      );
      this.winnerMap.billionaire = winner;
    }

    if (this.doSmile) {
      const s1 = await smileIntensity(this.img1);
      const s2 = await smileIntensity(this.img2);
      //   const winner =
      //     s1 && s2 ? (s1 > s2 ? "Portrait 1" : "Portrait 2") : "Could not detect";
      //   this.results.push(`Bigger smile: ${winner}`);
      if (s1 && s2) {
        const winner = s1 > s2 ? "portrait1" : "portrait2";
        winner === s1 ? this.img1Pts++ : this.img2Pts++;
        this.results.push(
          `Bigger smile: ${winner === "portrait1" ? "Portrait 1" : "Portrait 2"}`,
        );
        this.winnerMap.smile = winner;
      } else {
        this.results.push("Bigger smile: Could not detect");
      }
    }

    if (this.doSymmetry) {
      const sym1 = await symmetryScore(this.img1);
      const sym2 = await symmetryScore(this.img2);
      //   const winner =
      //     sym1 && sym2
      //       ? sym1 > sym2
      //         ? "Portrait 1"
      //         : "Portrait 2"
      //       : "Could not detect";
      //   this.results.push(`More symmetrical: ${winner}`);
      if (sym1 && sym2) {
        const winner = sym1 > sym2 ? "portrait1" : "portrait2";
        winner === "portrait1" ? this.img1Pts++ : this.img2Pts++;
        this.results.push(
          `More symmetrical: ${winner === "portrait1" ? "Portrait 1" : "Portrait 2"}`,
        );
        this.winnerMap.symmetry = winner;
      } else {
        this.results.push("More symmetrical: Could not detect");
      }
    }

    if (this.doAge) {
      const a1 = await ageGuess(this.img1);
      const a2 = await ageGuess(this.img2);
      //   const younger =
      //     a1 && a2 ? (a1 < a2 ? "Portrait 1" : "Portrait 2") : "Could not detect";
      //   this.results.push(`Looks younger: ${younger}`);
      if (a1 && a2) {
        const younger = a1 < a2 ? "portrait1" : "portrait2";
        younger === "portrait1" ? this.img1Pts++ : this.img2Pts++;
        this.results.push(
          `Looks younger: ${younger === "portrait1" ? "Portrait 1" : "Portrait 2"}`,
        );
        this.winnerMap.age = younger;
      } else {
        this.results.push("Looks younger: Could not detect");
      }
    }

    console.log("Result >>> ");
    console.log(JSON.stringify(this.winnerMap));

    m.redraw();
  },

  resetAll() {
    this.img1 = null;
    this.img2 = null;
    this.img1Pts = 0;
    this.img2Pts = 0;
    this.results = [];
    this.doResemblance = false;
    this.doBillionaire = false;
    this.doSmile = false;
    this.doSymmetry = false;
    this.doAge = false;
    this.winnerMap = {};
    m.redraw();
  },

  view() {
    return m("div.compare-container", [
      m("h2.appLabel", "Face Mash"),

      m("div.uploads", [
        m("div.upload-block", [
          m("input[type=file]", {
            onchange: (e) => this.fileToImage(e.target.files[0], "img1"),
          }),
          this.img1 &&
            m("img.preview", {
              src: this.img1.src,
              //   class: Object.values(this.winnerMap).includes("portrait1")
              //     ? "winner"
              //     : "",
              class:
                this.maxString(this.winnerMap) === "portrait1" ? "winner" : "",
            }),
          m("p.portraitLabel", "Portrait 1"),
        ]),
        m("div.upload-block", [
          m("input[type=file]", {
            onchange: (e) => this.fileToImage(e.target.files[0], "img2"),
          }),
          this.img2 &&
            m("img.preview", {
              src: this.img2.src,
              //   class: Object.values(this.winnerMap).includes("portrait2")
              //     ? "winner"
              //     : "",
              class:
                this.maxString(this.winnerMap) === "portrait2" ? "winner" : "",
            }),
          m("p.portraitLabel", "Portrait 2"),
        ]),
      ]),

      this.img1 &&
        this.img2 &&
        m("div.actions", [
          m("label", [
            m("input[type=checkbox]", {
              checked: this.doResemblance,
              onclick: (e) => (this.doResemblance = e.target.checked),
            }),
            "Resemblance",
          ]),
          m("label", [
            m("input[type=checkbox]", {
              checked: this.doBillionaire,
              onclick: (e) => (this.doBillionaire = e.target.checked),
            }),
            "Billionaire vibe",
          ]),
          m("label", [
            m("input[type=checkbox]", {
              checked: this.doSmile,
              onclick: (e) => (this.doSmile = e.target.checked),
            }),
            "Smile intensity",
          ]),
          m("label", [
            m("input[type=checkbox]", {
              checked: this.doSymmetry,
              onclick: (e) => (this.doSymmetry = e.target.checked),
            }),
            "Symmetry score",
          ]),
          m("label", [
            m("input[type=checkbox]", {
              checked: this.doAge,
              onclick: (e) => (this.doAge = e.target.checked),
            }),
            "Age guess",
          ]),
          m(
            "button.compareBtn",
            {
              onclick: () => this.runSelectedComparisons(),
            },
            "Run Comparison",
          ),
          m("button.reset-btn", { onclick: () => this.resetAll() }, "Reset"),
        ]),

      this.results.length > 0 &&
        m(
          "div.results",
          this.results.map((r) => m("p", r)),
        ),
    ]);
  },
};
