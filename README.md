```
ShortLink
|
├─ .gitignore
├─ app.js
├─ config
│  ├─ database.js
│  └─ passport.js
├─ controllers
│  ├─ authController.js
│  ├─ linkController.js
│  └─ pageController.js
├─ lib
│  └─ passwordUtils.js
├─ middlewares
│  └─ authMiddleware.js
├─ models
│  ├─ Link.js
│  └─ User.js
├─ package-lock.json
├─ package.json
├─ public
│  ├─ css
│  │  └─ style.css
│  ├─ images
│  │  ├─ admin-img-1.jpg
│  │  ├─ card-img-1.jpeg
│  │  ├─ card-img-2.jpeg
│  │  ├─ card-img-3.jpeg
│  │  ├─ card-img-4.jpeg
│  │  ├─ contact.jpeg
│  │  ├─ index-img-1.jpeg
│  │  ├─ index-img-2.jpeg
│  │  ├─ index-img-3.jpeg
│  │  ├─ index-img-4.jpeg
│  │  ├─ logo-2.png
│  │  └─ logo.png
│  └─ js
│     ├─ auth.js
│     ├─ modal.js
│     ├─ script.js
│     └─ table.js
├─ README.md
└─ views
   ├─ contact.html
   ├─ dashboard.html
   ├─ forgot.html
   ├─ index.html
   ├─ login.html
   ├─ register.html
   ├─ reset.html
   ├─ resetForgotPassword.html
   └─ verify.html

```

# SHORT LİNK

### GEREKSİNİMLER

Package Json içindeki tüm modüller proje için gereklidir.

Şablon dili olarak ejs yerine Nunjucks kullandım. Jinja şablon diline benzer olduğu için onu kullandım

Authentication işlemleri için Passport Js modülünü kullandım.

---

### Routes

1.  Link Routes - Bu Link kontrollerini gelen istekleri yönlendirmek amaçlı kullandığım Routes

2.  Page Routes - Bu Sayfaları render etmek amaçlı kullandığım Routes. Burda bazı sayfaları render ediyorum. ve herhangi bir fonskiyon veya kontrol kullanmıyorum.

3.  Auth routes - Asıl en önemli Routes bu. bunu gelen kullanıcı isteklerini yönlendirmek için kullanıyorum.
    Birkaç Middleware kullanıyorum. Bu Middleware'ler Kullanıcının oturum açıp açmadığını yada kullanıcının hesabını açıp açmadığını kontrol eder.

### Controller

1.  Link Controller - Bu Controller'da link oluşturma, Silme, güncelleme, link sayfasını gösterme, Tüm linkleri alma gibi işlemler oluyor. ve her bir linkin benzersiz olması için temel fonskiyonumuz yer alıyor

2.  Page Controller - Gelen isteklere göre sayfaları render eden fonksiyonlarımı export ediyorum burda. Pek birşey yok.

3.  Auth Controller - Burda en önemli kodlar yer almaktadır.
    Bu controller da şu işlemler olmaktadır.
    - Kullanıcı oluştur
    - Kullanıcı sil
    - Kullanıcı güncelle
    - Kullanıcı giriş
    - Kullanıcı çıkış
    - Doğrulama Maili gönder
    - Şifre sıfırlama maili gönder
    - İletişim maili gönder

bunun gibi önemli control fonksiyonları yer alıyor.

### App Js

App js dosyamız bizim ana dosyamız bu dosyamızda pek fazla birşey yok çünkü tüm işlemleri router dosyalarıan ayırdık. ve modüler bir şekilde projemizi geliştirdik. App js dosyamıza düşen yük ise gerekli middlewareleri ekemek ve Şablon dosyaları, static dosyalar gibi önemli kodları eklemek oldu.

Ve ayrıca form verilerini işlemek için body-parser, Kullanıcı oturumlarını yönetmek için session ve passport js gibi modülleri kullandık.

Passport js demişken onu da `config/passportConfig.js` dosyasında konfigre ettik.
Ben doğrulama işlemini e psota ve şifreye göre yaptım ancak istersen Username ile de yapabilirsin..

Ve Kullanıcının profil resmini güncellemesi için formdan gelen resim dosyasını kaydetmek için ise `Multer` modülünü kullandık.
Onun için de `config/multerConfig.js` dosyasında gerekli yapılandırmayı yaptım.

### Public

Bu dizin altında ise css, js, image gibi static dosyalarımız bulunuyor. bu dizinde en önemli klasör js/ klasörü. Çünkü burda formlarımızdan gelen verileri sunucuya göndermek için Fetch api kullandık. ve olabildiğince modüler olmaya çalıştık.

- Auth - Bu dosyada formları işlemek için gerekli kodlarımız yer almaktadır.
- linkTable - Bu dosyada ise gelen link verilerini tabloda göstermek. Detaylara bakmak, tablo üzerinde arama yapmak, sayfalandırma gibi işlemleri gerçekleştirdim.
- userTable - Bu dosyada da gelen kullanıcı verilerini tabloya eklemek, rollerini güncellemek, kullanıcıları silmek, arama yapmak, detaylarına bakmak gibi işlemler yapabiliyoruz.
  Bu Dosyaya sadece admin ve mod yetkisine sahip kullanıcılar ulaşabilir. bu yüzden nunjucks ile role kontrolü yaptım.
- Script - Bu dosyada ise sayfanın temasını değiştirmek amaçlı birkaç kod yazdım. İlerleyen zamanlarda sayfa ile ilgili temel kodları bu dosyaya ekleyeceğiz.

### Views

Views klasörünün yapısı bu dosyanın en başındaki ağaç şemasında yazılı.

Nunjucks'daki Block yapısından elimden geldiğince yararlanmaya çalıştım. bu block özelliği diğer şablon dillerinde olmadığı için bu konuda avantaj sağladı bize.

Views altındaki Layouts/ klasöründe tüm dosyalarımızda temel yapı olarak kullandığımız base dosyası var. Ve base dosyası için gerekli sayfa parçaları da \_navbar, \_header, \_footer, gibi dosyalarda yer almaktadır. Bu şekilde html sayfalarımızı daha kolay yönetebiliriz.

Base dosyası dışında kullanıcı ve link işlemleri için olmazsa olmaz tablolandırma ve detay sayfası için modeller dosyaları var.
Ayrıca Link eklemek için \_addlink dosyası bulunmaktadır.

Şimdi gelelim Views klasörümüzün ana dizinine...

Ana dizin altında tabiki bizim ana sayfalarımız yer almaktadır.

- Index
- About
- Contact
- Dashboard
- Profile
- Login
- Register
- Reset
- Verify
- Forgot
- Redirect (Link Yönlendirme Sayfamız)

sayfaları yer almaktadır.

### Models

Bu dizin altında bizim Kullanıcı ve Link modellerimiz yer almaktadır.

Detaylar için modelleri inceleyebilirsiniz.

### Lib

Bu dizin altında tek bir dosyamız var. O dosya da Şirfeleri doğrulamak ve oluşturmak için kullanılan fonksiyonlarımızı `export` ediyoruz. (Dışarıya açıyoruz)

### Database

Veritabanı yapılandırma dosyamı `config/` altındaki `database.js` dosyasında bulunuyor. Burada sadece temel bağlanma ve cevap döndürme işlemleri yapıyoruz.

Veritabanını `export` edip app dosyamızda bağlantıyı başlatıyoruz.
