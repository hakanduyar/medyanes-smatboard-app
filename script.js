document.addEventListener("DOMContentLoaded", () => {
  const bookList = document.getElementById("book-list");

<<<<<<< HEAD
  // Kitapların listesini oluştur
  const books = [
    { title: "Kitap 3", folder: "Dusunme-Becerileri-ve-Kodlama", cover: "assets/books/Dusunme-Becerileri-ve-Kodlama/Dusunme-Becerileri-ve-Kodlama_Page_01.png", pageCount: 32},
    { title: "Kitap 1", folder: "diger-kitap", cover: "assets/books/diger-kitap/diger-kitap_Page_01.png", pageCount: 1 },
    { title: "Kitap 2", folder: "Hakan", cover: "assets/books/Hakan/Hakan_Page_01.png", pageCount: 1 },
    { title: "Kitap 3", folder: "Ilker", cover: "assets/books/Ilker/Ilker_Page_01.png", pageCount: 2 },
    { title: "Kitap 3", folder: "Dusunme-Becerileri-ve-Kodlama", cover: "assets/books/Dusunme-Becerileri-ve-Kodlama/Dusunme-Becerileri-ve-Kodlama_Page_01.png" , pageCount: 32},
    // Diğer kitaplar...
    { title: "Kitap 3", folder: "Dusunme-Becerileri-ve-Kodlama", cover: "assets/books/Dusunme-Becerileri-ve-Kodlama/Dusunme-Becerileri-ve-Kodlama_Page_01.png" , pageCount: 32},
    { title: "Kitap 1", folder: "diger-kitap", cover: "assets/books/diger-kitap/diger-kitap_Page_01.png", pageCount: 1 },
    { title: "Kitap 2", folder: "Hakan", cover: "assets/books/Hakan/Hakan_Page_01.png", pageCount: 1 },
    { title: "Kitap 3", folder: "Ilker", cover: "assets/books/Ilker/Ilker_Page_01.png", pageCount: 2 },
    { title: "Kitap 3", folder: "Dusunme-Becerileri-ve-Kodlama", cover: "assets/books/Dusunme-Becerileri-ve-Kodlama/Dusunme-Becerileri-ve-Kodlama_Page_01.png", pageCount: 32 },
    // Diğer kitaplar...
=======
  // assets/books klasöründen kitapları listele
  const books = [
    { title: "Düşünme Becerileri ve Kodlama", folder: "Dusunme-Becerileri-ve-Kodlama", cover: "assets/books/Dusunme-Becerileri-ve-Kodlama/Dusunme-Becerileri-ve-Kodlama_Page_01.png" },
      { title: "Enes", folder: "Enes", cover: "assets/books/baska-kitap/baska-kitap_Page_01.png" },
      { title: "İlker", folder: "İlker", cover: "assets/books/baska-kitap/baska-kitap_Page_01.png" },
      { title: "Hakan", folder: "Hakan", cover: "assets/books/baska-kitap/baska-kitap_Page_01.png" },
      { title: "Düşünme Becerileri ve Kodlama", folder: "Dusunme-Becerileri-ve-Kodlama", cover: "assets/books/Dusunme-Becerileri-ve-Kodlama/Dusunme-Becerileri-ve-Kodlama_Page_01.png" },
      { title: "Diğer Kitap", folder: "diğer-kitap", cover: "assets/books/diğer-kitap/diğer-kitap_Page_01.png" },
      { title: "b", folder: "b", cover: "assets/books/baska-kitap/baska-kitap_Page_01.png" },
      { title: "Başka Kitap", folder: "baska-kitap", cover: "assets/books/baska-kitap/baska-kitap_Page_01.png" },
      { title: "Düşünme Becerileri ve Kodlama", folder: "Dusunme-Becerileri-ve-Kodlama", cover: "assets/books/Dusunme-Becerileri-ve-Kodlama/Dusunme-Becerileri-ve-Kodlama_Page_01.png" },
      { title: "c", folder: "c", cover: "assets/books/baska-kitap/baska-kitap_Page_01.png" },
      { title: "d", folder: "d", cover: "assets/books/baska-kitap/baska-kitap_Page_01.png" },
      { title: "Düşünme Becerileri ve Kodlama", folder: "Dusunme-Becerileri-ve-Kodlama", cover: "assets/books/Dusunme-Becerileri-ve-Kodlama/Dusunme-Becerileri-ve-Kodlama_Page_01.png" },
      { title: "e", folder: "e", cover: "assets/books/baska-kitap/baska-kitap_Page_01.png" },
      { title: "f", folder: "f", cover: "assets/books/baska-kitap/baska-kitap_Page_01.png" },
      { title: "g", folder: "g", cover: "assets/books/baska-kitap/baska-kitap_Page_01.png" },
      { title: "Düşünme Becerileri ve Kodlama", folder: "Dusunme-Becerileri-ve-Kodlama", cover: "assets/books/Dusunme-Becerileri-ve-Kodlama/Dusunme-Becerileri-ve-Kodlama_Page_01.png" },
      { title: "h", folder: "h", cover: "assets/books/baska-kitap/baska-kitap_Page_01.png" },
>>>>>>> ac764e86d2da1a15bce4193bdd635c273646350c
  ];

  // Kitap kapaklarını ekrana yerleştir
  books.forEach(book => {
      const bookItem = document.createElement("div");
<<<<<<< HEAD
      bookItem.classList.add("book-item");
      
      const bookCover = document.createElement("img");
      bookCover.src = book.cover;
      bookCover.alt = book.title;
      bookCover.classList.add("book-cover");
      
      const bookTitle = document.createElement("div");
      bookTitle.classList.add("book-title");
      bookTitle.textContent = book.title;

      bookCover.addEventListener("click", () => {
          // Kitaba tıklayınca app.html sayfasına yönlendir ve kitabı yükle
          window.location.href = `app.html?book=${book.folder}`;  // Dinamik olarak kitap klasörünü belirt
          localStorage.setItem('selectedBookTotalPages', book.pageCount); // Toplam sayfa sayısını kaydet
      });

      bookItem.appendChild(bookCover);
      bookItem.appendChild(bookTitle);
=======
      bookItem.classList.add("book-items");

      const mainBookWrap = document.createElement("div");
      mainBookWrap.classList.add("main-book-wrap");

      const bookCover = document.createElement("div");
      bookCover.classList.add("book-cover");

      const bookInside = document.createElement("div");
      bookInside.classList.add("book-inside");

      const bookImage = document.createElement("div");
      bookImage.classList.add("book-image");

      const img = document.createElement("img");
      img.src = book.cover;
      img.alt = book.title;

      const effect = document.createElement("div");
      effect.classList.add("effect");

      const light = document.createElement("div");
      light.classList.add("light");

      // Kitap kapaklarına tıklama olayını ekle
      bookImage.addEventListener("click", () => {
          // Kitaba tıklayınca app.html sayfasına yönlendir ve kitabı yükle
          window.location.href = `app.html?book=${encodeURIComponent(book.folder)}`;
      });

      bookImage.appendChild(img);
      bookImage.appendChild(effect);
      bookImage.appendChild(light);

      bookCover.appendChild(bookInside);
      bookCover.appendChild(bookImage);

      mainBookWrap.appendChild(bookCover);
      bookItem.appendChild(mainBookWrap);

>>>>>>> ac764e86d2da1a15bce4193bdd635c273646350c
      bookList.appendChild(bookItem);
  });
});
