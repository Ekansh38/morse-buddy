const MORSE = {
  'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....',
  'I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.',
  'Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-',
  'Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
  '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'
};

export async function POST(request) {
  const { char, input, isWord } = await request.json();

  if (!char || typeof input !== 'string') {
    return Response.json({ error: 'Missing char or input' }, { status: 400 });
  }

  let expected;
  if (isWord) {
    expected = char.toUpperCase().split('').map(c => MORSE[c]).join(' ');
  } else {
    expected = MORSE[char.toUpperCase()];
  }

  if (!expected) {
    return Response.json({ error: 'Unknown character' }, { status: 400 });
  }

  const correct = input.trim() === expected;

  return Response.json({ correct, expected });
}
