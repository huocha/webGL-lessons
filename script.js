(function () {
  console.log("init");
  const $menu = document.querySelector("#menu");
  const list = [
    {
      path: "canvas",
      title: "Canvas",
      children: [
        {
          path: "/280420/",
          title: "Mandala",
        },
        {
          path: "/280420/",
          title: "Mandala 2",
        },
      ],
    },
    {
      path: "webGL",
      title: "WebGL",
      children: [
        {
          path: "/060820/",
          title: "Convolution",
        },
        {
          path: "/240920/",
          title: "Game of Life",
        },
      ],
    },
  ];

  function render() {
    let result = "";
    list.forEach((item) => {
      result += `<li>${item.title}`;
      result += `<ul>`;

      item.children.forEach((child) => {
        result += `<li><a href=${item.path}/${child.path}/index.html>${child.title}</li>`;
      });
      result += `</ul> </li>`;
    });
    $menu.innerHTML = result;
  }

  render();
})();
