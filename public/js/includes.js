function loadIncludes() {
  // Navbar yükle
  fetch("../backend/includes/navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar").innerHTML = data;
    })
    .catch(err => console.error("Navbar yüklenemedi:", err));

  // Blob yükle
  fetch("../backend/includes/blob.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("blob").innerHTML = data;
    })
    .catch(err => console.error("Blob yüklenemedi:", err));

   //kart ekleme TEST SAYFASI
fetch("../backend/includes/card.html")
.then(response => response.text())
.then(data => {

  const temp = document.createElement("div");
  temp.innerHTML = data;

  // CSS <link> varsa head'e ekle (bir kere)
  const styleLink = temp.querySelector("link[rel='stylesheet']");
  if (styleLink && !document.querySelector(`link[href="${styleLink.href}"]`)) {
    document.head.appendChild(styleLink.cloneNode());
  }

  const cardContent = temp.querySelector(".card-test");

  document.querySelectorAll(".card-test").forEach(card => {
    card.innerHTML = cardContent.innerHTML;
  });
})
.catch(err => console.error("Card yüklenemedi:", err));



     //kart ekleme BLOG SAYFASI
fetch("../backend/includes/card.html")
.then(response => response.text())
.then(data => {

  const temp = document.createElement("div");
  temp.innerHTML = data;

  // CSS <link> varsa head'e ekle (bir kere)
  const styleLink = temp.querySelector("link[rel='stylesheet']");
  if (styleLink && !document.querySelector(`link[href="${styleLink.href}"]`)) {
    document.head.appendChild(styleLink.cloneNode());
  }

  const cardContent = temp.querySelector(".card-blog");

  document.querySelectorAll(".card-blog").forEach(card => {
    card.innerHTML = cardContent.innerHTML;
  });
})
.catch(err => console.error("Card yüklenemedi:", err));

}

// Sayfa yüklendiğinde çalıştır
document.addEventListener("DOMContentLoaded", loadIncludes);
