# Audio examples: source and attribution

The four VCTK rows cover two speakers and shorter/longer utterances. They illustrate matched system outputs and are not subjective scores or a claim that these examples represent population-level preference.

## Corpus

Speech is from the **CSTR VCTK Corpus**, by Junichi Yamagishi, Christophe Veaux, and Kirsten MacDonald (2019), University of Edinburgh. Dataset record: https://doi.org/10.7488/ds/2645 (version 0.92), licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). These are bandwidth-limited and model-reconstructed derivatives, not unmodified original recordings. The original corpus authors do not endorse this project.

## Signal provenance

- 16 kHz, mono, IEEE float32 WAV containers. Existing exported audio is copied without re-normalization, trimming, or alignment changes.
- **LR / HR:** paired evaluation input and target. The LR is the stored input actually used for evaluation, not a separately synthesized approximation.
- **HWB-plus:** reimplemented baseline, checkpoint epoch 50.
- **HARP:** independent main-route reproduction, best checkpoint epoch 49. These are not recovered audio from the original three training seeds in the headline table.
- The HARP native output retains its original PCM16 sample quantization inside the float32 container. Plus native samples are float32. The inherited export preserved these values rather than regenerating or modifying either condition.

The four columns share the same utterance and stored degradation. Individual filter parameters were not re-estimated for this page. Details and file locations for each public row appear in `audio-manifest.json`. No listening-study configuration, condition-key mapping, or participant data is included in this repository.
