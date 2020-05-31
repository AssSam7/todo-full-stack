document.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-me")) {
    let newItem = prompt(
      "Enter the new todo list item",
      e.target.parentElement.parentElement.querySelector(".item-text")
        .textContent
    );
    if (newItem) {
      axios
        .post("/update-item", {
          text: newItem,
          id: e.target.getAttribute("data-id"),
        })
        .then(() => {
          e.target.parentElement.parentElement.querySelector(
            ".item-text"
          ).innerHTML = newItem;
        })
        .catch((err) => {});
    }
  }
});
