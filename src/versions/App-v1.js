import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";

// https://api.edamam.com/api/nutrition-data?app_id=57c760d9&app_key=8aa4fe80c850f6a249baef420980e6cd&nutrition-type=logging&ingr=apples
// https://api.rawg.io/api/platforms?key=YOUR_API_KEY
// https://newsapi.org/v2/everything?q=bitcoin&apiKey=API_KEY

// const APP_ID = "57c760d9";
// const API_KEY = "8aa4fe80c850f6a249baef420980e6cd";
// const API_KEY = "7763f6bfce4242c5b2b9298f0efb1b8f";
const API_KEY = "ba1ffded503547d0ab97540410145bb5";

export default function App() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [favoriteItems, setFavoriteItems] = useState(function () {
    const storedItems = localStorage.getItem("favorites");
    return JSON.parse(storedItems) || [];
  });

  function handleSelected(item) {
    setSelectedItem((currentItem) =>
      currentItem?.title !== item.title ? item : null
    );
  }

  function handleClose() {
    setSelectedItem(null);
  }

  function handleAddItemToFavorites(item) {
    setFavoriteItems((currentItems) => [...currentItems, item]);
    setSelectedItem(null);
  }

  function handleDeleteItemFromFavorites(title) {
    setFavoriteItems((currentItems) =>
      currentItems.filter((currItem) => currItem.title !== title)
    );
  }

  useEffect(
    function () {
      async function fetchData() {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${search}&apiKey=${API_KEY}`
        );

        if (!response.ok) {
        }

        const data = await response.json();
        const recentData = data.articles.slice(0, 10);
        setItems(recentData);
      }

      if (search.length < 3) {
        setItems([]);
        return;
      }
      fetchData();
    },
    [search]
  );

  useEffect(
    function () {
      localStorage.setItem("favorites", JSON.stringify(favoriteItems));
    },
    [favoriteItems]
  );

  return (
    <div>
      <Logo
        search={search}
        onSearch={setSearch}
        favoriteItems={favoriteItems}
      />
      <Lists
        items={items}
        favoriteItems={favoriteItems}
        selectedItem={selectedItem}
        onSelected={handleSelected}
        onClose={handleClose}
        onAddItemToFavorites={handleAddItemToFavorites}
        onDeleteItemFromFavorites={handleDeleteItemFromFavorites}
      />
    </div>
  );
}

function Logo({ favoriteItems, search, onSearch }) {
  const searchRef = useRef(null);
  const numItems = favoriteItems.length;

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Enter" || e.code === "NumpadEnter") {
          searchRef.current.focus();
          onSearch("");
        }
      }

      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [onSearch]
  );

  return (
    <header style={{ display: "flex", justifyContent: "space-between" }}>
      <h1>News Tracker</h1>
      <input
        type="text"
        ref={searchRef}
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by product name..."
      />
      <p>You have {numItems} article(s) saved to your favorites.</p>
    </header>
  );
}

// function Search() {}

// function Stats() {}

function Lists({
  items,
  favoriteItems,
  selectedItem,
  onSelected,
  onClose,
  onAddItemToFavorites,
  onDeleteItemFromFavorites,
}) {
  const [isOpen1, setIsOpen1] = useState(true);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <main style={{ display: "flex", justifyContent: "space-evenly" }}>
      <section>
        <span onClick={() => setIsOpen1((current) => !current)}>
          {isOpen1 ? "-" : "+"}
        </span>
        {isOpen1 && (
          <ul style={{ listStyleType: "none" }}>
            {items.map((item) => (
              <Item
                key={crypto.randomUUID() + item.title}
                item={item}
                onSelected={onSelected}
              />
            ))}
          </ul>
        )}
      </section>

      {selectedItem ? (
        <section>
          <span onClick={() => setIsOpen2((current) => !current)}>
            {isOpen2 ? "-" : "+"}
          </span>
          {isOpen2 && (
            <ul>
              <ItemDetails
                favoriteItems={favoriteItems}
                selectedItem={selectedItem}
                onClose={onClose}
                onAddItemToFavorites={onAddItemToFavorites}
              />
            </ul>
          )}
        </section>
      ) : (
        <section>
          <span onClick={() => setIsOpen2((current) => !current)}>
            {isOpen2 ? "-" : "+"}
          </span>
          {isOpen2 && (
            <ul>
              <Summary favoriteItems={favoriteItems} />
              {favoriteItems.map((item) => (
                <FavoriteItem
                  key={crypto.randomUUID() + item.title}
                  item={item}
                  onDeleteItemFromFavorites={onDeleteItemFromFavorites}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

function Item({ item, onSelected }) {
  return (
    <li style={{ width: "300px" }} onClick={() => onSelected(item)}>
      <img style={{ width: "200px" }} src={item.urlToImage} alt={item.title} />
      <h2 style={{ fontSize: "1.2rem" }}>{item.title}</h2>
    </li>
  );
}

function FavoriteItem({ item, onDeleteItemFromFavorites }) {
  return (
    <li style={{ width: "300px" }}>
      <img style={{ width: "200px" }} src={item.urlToImage} alt={item.title} />
      <h2 style={{ fontSize: "1.2rem" }}>{item.title}</h2>
      <span>{item.rating} rating</span>
      <a href={item.url}>View Full Article</a>
      <button onClick={() => onDeleteItemFromFavorites(item.title)}>
        Delete
      </button>
    </li>
  );
}

function ItemDetails({
  favoriteItems,
  selectedItem,
  onClose,
  onAddItemToFavorites,
}) {
  const [rating, setRating] = useState(0);

  const isFavorite = favoriteItems
    .map((item) => item.title)
    .includes(selectedItem.title);

  const userRating = favoriteItems.find(
    (item) => item.title === selectedItem.title
  )?.rating;

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          onClose();
        }
      }

      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [onClose]
  );

  return (
    <li style={{ width: "300px" }}>
      <button onClick={onClose}>&larr;</button>
      <img
        style={{ width: "200px" }}
        src={selectedItem.urlToImage}
        alt={selectedItem.title}
      />
      <h2 style={{ fontSize: "1.2rem" }}>{selectedItem.title}</h2>
      <span>
        {selectedItem.author} {selectedItem.source.name}
      </span>
      <p>{selectedItem.description}</p>
      <span>{selectedItem.publishedAt}</span>

      {isFavorite ? (
        <p>You rated the current article {userRating} out of 5.</p>
      ) : (
        <StarRating maxRating={5} size={24} onSetRating={setRating} />
      )}
      <a href={selectedItem.url}>Read Full Article</a>
      {rating ? (
        <button
          onClick={() =>
            onAddItemToFavorites({ ...selectedItem, rating: rating })
          }
        >
          Add to favorites
        </button>
      ) : null}
    </li>
  );
}

function Summary({ favoriteItems }) {
  const numItems = favoriteItems.length;

  return (
    <section>
      <span>{numItems} articles saved</span>
      <span>{favoriteItems.rating} rating</span>
      <span>length</span>
    </section>
  );
}

/*
author
: 
content
: 
description
: 
publishedAt
: 
source
: 
{id:, name: }
title
: 
url
: 
urlToImage
: 
*/
