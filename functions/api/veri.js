Cloudflare Pages + KV ile sonfasil.com Canlı Kaydetme Kurulumu

Ekran görüntünüzde tam doğru yerdesiniz. Aşağıdaki 4 kısa adımı tamamladığınızda yönetim panelinden yaptığınız her değişiklik anında sonfasil.com adresinde online olarak yayınlanacaktır.

Adım 1: KV Namespace Oluşturun

Ekran görüntünüzdeki Workers KV > Create a KV namespace satırına tıklayın.

Namespace Name kutusuna SONFASIL_DATA yazın ve Add butonuna basın.

Adım 2: Klasör Yapınızı Hazırlayın

Bilgisayarınızdaki site klasörünün (index.html, bayraktasiyan.gif, bg.jpg dosyalarınızın olduğu klasörün) içine functions adında bir klasör, onun içine de api adında bir klasör açın ve içine veri.js dosyasını oluşturun:

sonfasil-site/
├── index.html
├── bayraktasiyan.gif
├── bg.jpg
└── functions/
    └── api/
        └── veri.js


functions/api/veri.js Dosyasının İçeriği

Aşağıdaki kodu kopyalayıp functions/api/veri.js içine kaydedin:

export async function onRequestGet({ env }) {
  try {
    const raw = await env.SONFASIL_KV.get("portal_state");
    return new Response(raw || "{}", {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const incomingPass = String(body.password || "");
    const existingRaw = await env.SONFASIL_KV.get("portal_state");
    let currentPass = "1234";

    if (existingRaw) {
      const parsed = JSON.parse(existingRaw);
      if (parsed?.portalState?.config?.adminPassword) {
        currentPass = String(parsed.portalState.config.adminPassword);
      }
    }

    if (incomingPass !== currentPass) {
      return new Response(JSON.stringify({ ok: false, error: "Parola hatalı!" }), {
        status: 401,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    const payload = JSON.stringify({
      portalState: body.portalState,
      portalItems: body.portalItems,
      guestbookEntries: body.guestbookEntries,
      updatedAt: new Date().toISOString()
    });

    await env.SONFASIL_KV.put("portal_state", payload);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}


Adım 3: Cloudflare Pages'e Yükleyin ve KV'yi Bağlayın

Cloudflare sol menüsünden Workers & Pages bölümüne girin ve sonfasil.com projenizi açın (yoksa Create > Pages > Upload assets ile sonfasil-site klasörünüzü yükleyin).

Projenizin içinde Settings → Functions → KV namespace bindings bölümüne gelin ve Add binding butonuna basın:

Variable name: SONFASIL_KV (birebir aynı yazılmalıdır)

KV namespace: Az önce oluşturduğunuz SONFASIL_DATA seçeneğini seçin ve Save deyin.

Değişikliğin aktif olması için Deployments sekmesinden son dağıtıma Retry deployment yapın veya klasörü tekrar yükleyin.

Adım 4: Canlı Kullanım

Kurulum bittikten sonra sonfasil.com adresinize girip yönetim panelini açtığınızda (yonetim yazarak veya Ctrl + Shift + L ile) yaptığınız her değişiklik otomatik olarak Cloudflare KV'ye kaydedilir ve tüm öğrencilerinizde anında görünür.