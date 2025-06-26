function generateTypos(domain) {
  const typos = new Set();
  const [name, tld] = domain.split('.');
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  const qwerty = {
    a: 'qwsz', b: 'vghn', c: 'xdfv', d: 'serfcx', e: 'wsdr',
    f: 'drtgvc', g: 'ftyhbv', h: 'gyujnb', i: 'ujko', j: 'huikmn',
    k: 'jiolm', l: 'kop', m: 'njk', n: 'bhjm', o: 'iklp',
    p: 'ol', q: 'wa', r: 'edft', s: 'awedxz', t: 'rfgy',
    u: 'yhji', v: 'cfgb', w: 'qase', x: 'zsdc', y: 'tghu',
    z: 'asx', '1': '2q', '2': '13w', '3': '24e', '4': '35r',
    '5': '46t', '6': '57y', '7': '68u', '8': '79i', '9': '80o', '0': '9p'
  };

  const homoglyphs = {
    a: ['@', 'à', 'á'], c: ['ç'], e: ['3', '€', 'ë'], i: ['1', 'l', '!', 'í'],
    l: ['1', 'i'], o: ['0', 'ø'], s: ['5', '$'], z: ['2']
  };

  // Omission
  for (let i = 0; i < name.length; i++) {
    typos.add(name.slice(0, i) + name.slice(i + 1));
  }

  // Transposition
  for (let i = 0; i < name.length - 1; i++) {
    typos.add(name.slice(0, i) + name[i + 1] + name[i] + name.slice(i + 2));
  }

  // Insertion
  for (let i = 0; i <= name.length; i++) {
    for (const c of chars) {
      typos.add(name.slice(0, i) + c + name.slice(i));
    }
  }

  // Replacement (QWERTY neighbors)
  for (let i = 0; i < name.length; i++) {
    const char = name[i];
    if (qwerty[char]) {
      for (const repl of qwerty[char]) {
        typos.add(name.slice(0, i) + repl + name.slice(i + 1));
      }
    }
  }

  // Homoglyphs
  for (let i = 0; i < name.length; i++) {
    const char = name[i];
    if (homoglyphs[char]) {
      for (const h of homoglyphs[char]) {
        typos.add(name.slice(0, i) + h + name.slice(i + 1));
      }
    }
  }

  // Simple subdomain-like and postfix variants
  typos.add(`${name}-${tld}`);
  typos.add(`${name}${tld}`);
  typos.add(`${name}123`);

  return Array.from(typos).map(v => `${v}.${tld}`);
}

async function checkDomain(domain) {
  try {
    const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=A`, {
      headers: { 'Accept': 'application/dns-json' }
    });
    const data = await response.json();
    return data.Answer ? true : false;
  } catch {
    return false;
  }
}

async function startScan() {
  const input = document.getElementById('domainInput').value.trim();
  const variants = generateTypos(input);
  const resultDiv = document.getElementById('results');
  resultDiv.innerHTML = '';

  for (let domain of variants.slice(0, 30)) {
    const isActive = await checkDomain(domain);
    const status = isActive ? '✅ ACTIVE' : '❌ Inactive';
    const resultLine = document.createElement('div');
    resultLine.textContent = `${domain}: ${status}`;
    resultDiv.appendChild(resultLine);
  }
}
