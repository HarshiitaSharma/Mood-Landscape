// Feeling vocabulary. Each stem maps to [mood, energy, time] in the range 0..1.
// Stems match inside longer words ("frustrat" matches "frustrated").
const WORDS = {
  happy:[.92,.7,.85], joy:[.95,.8,.85], great:[.9,.7,.8], good:[.8,.5,.8], excited:[.9,.95,.8], energetic:[.85,.95,.8],
  love:[.95,.6,.8], proud:[.88,.6,.8], playful:[.9,.85,.85], motivat:[.85,.85,.75], confident:[.85,.7,.8], fine:[.6,.35,.7], okay:[.55,.3,.65],
  calm:[.7,.12,.7], peace:[.75,.1,.7], relax:[.75,.12,.6], chill:[.7,.15,.6], content:[.75,.2,.75], serene:[.78,.08,.65], cozy:[.7,.1,.3],
  hope:[.7,.45,.5], grateful:[.85,.3,.75], curious:[.75,.6,.7], nostalg:[.5,.15,.35],
  sad:[.14,.18,.3], down:[.15,.15,.3], low:[.15,.15,.3], cry:[.08,.25,.2], lonely:[.22,.15,.1], empty:[.2,.1,.2], numb:[.25,.05,.25], grief:[.08,.15,.15], hurt:[.15,.3,.25],
  anxious:[.2,.9,.4], anxiety:[.2,.9,.4], stress:[.2,.88,.45], panic:[.1,1,.3], worried:[.25,.8,.4], overwhelm:[.15,.9,.35], nervous:[.3,.85,.5],
  angry:[.05,.95,.4], mad:[.05,.9,.4], frustrat:[.12,.85,.5], irritat:[.2,.8,.5],
  tired:[.4,.05,.12], sleepy:[.5,.05,.08], exhaust:[.3,.03,.1], bored:[.4,.1,.55], burn:[.2,.1,.2]
};
const CHIPS = ['calm','happy','anxious','lonely','tired but hopeful','excited','angry','not okay','cozy'];
const NEG = /\b(not|never|no|don'?t|isn'?t|aren'?t|can'?t|barely)\s+(\w+\s+)?$/;
