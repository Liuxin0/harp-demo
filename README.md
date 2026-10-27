# HARP project companion

**HARP: Source–Envelope Reconstruction for Lightweight Speech Bandwidth Extension**

Project page: https://liuxin0.github.io/harp-demo/

A dependency-free static research page with method illustrations, system results, controlled comparisons, four paired VCTK listening examples, and placeholders for unavailable conditions. It is not an online inference service. The manuscript and model release are not included.

## Preview

Run `node tools/serve.mjs` and open http://127.0.0.1:4173/. No package installation is required.

## Add verified audio

1. Put approved audio under `audio/<corpus>/<utterance>/`.
2. Edit `audio-manifest.json`: fill the utterance ID, degradation, provenance, and relative audio paths for the selected row. Keep unavailable sources `null`.
3. Match utterance, alignment, degradation, and normalization across a row. Record which checkpoint produced each output. A replacement run must not be labeled as an original three-seed checkpoint.
4. Keep HR-input / HR-fit examples in the **analysis-only** group. They use information unavailable at deployment.
5. Preview all groups. Only non-empty paths produce audio players; missing files must not be represented as completed results.

The VCTK group contains four examples (16 WAV files); LibriSpeech and HR-analysis groups remain placeholders. No subjective ratings are reported. See `audio/README.md` for provenance and corpus attribution.

## Figures

- `assets/harp-concept.png`: AI-generated conceptual explanation, not experimental spectra. The aperiodic support is described as noise-like, not stochastic noise injection.
- `assets/harp-method.drawio`: editable **two-page draw.io** document (overall pipeline; branch renderer and LAEA). Open in draw.io / diagrams.net.
- `assets/harp-overview.svg`, `assets/harp-renderer.svg`: lightweight SVG previews generated from the same geometry as the draw.io source.
- `tools/build-diagrams.mjs`: rebuilds the editable source and previews with connected arrows.

The visual organization takes inspiration from the ReZero project page (https://innerselfm.github.io/rezero/). No ReZero artwork is copied.

## Evidence boundaries

- HARP and HWB-plus have the same reported approximate budget: 194K parameters and 21.67M MAC/s. This is a quality gain at the same budget, not a compute reduction relative to HWB-plus.
- The main HARP VCTK row is mean ± sample SD over three seeds. Ablations and HR analyses are separate single-seed conditions.
- Sinc, AERO, BAE-Net, BAE-Lite, and HWB-Net scores use the HWB-Net matched-protocol study. HWB-plus, VM-ASR, and AP-BWE are evaluated in the present study. External reported MAC conventions differ.
- LibriSpeech systems are independently trained with official dev/test splits. LSD is comparable, PESQ is higher, and no-reference scores slightly favor HWB-plus in this single-run comparison.
- Target-side fitting is a related representation, not an exact deployed parameter family, teacher, or theoretical LSD optimum.
- VCTK shares validation and reporting speakers under the inherited protocol. English-only synthetic degradation and the absence of human MOS remain limitations.

## Deployment

GitHub Pages serves the repository root on `main`; `.nojekyll` disables Jekyll processing. Commit and push changes to update the page. No analytics, external fonts, or third-party scripts are loaded.
