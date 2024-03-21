import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";

// https://api.edamam.com/api/nutrition-data?app_id=57c760d9&app_key=8aa4fe80c850f6a249baef420980e6cd&nutrition-type=logging&ingr=apples
// https://api.rawg.io/api/platforms?key=YOUR_API_KEY
// https://newsapi.org/v2/everything?q=bitcoin&apiKey=API_KEY

// const APP_ID = "57c760d9";
// const API_KEY = "8aa4fe80c850f6a249baef420980e6cd";
// const API_KEY = "7763f6bfce4242c5b2b9298f0efb1b8f";
const API_KEY = "ba1ffded503547d0ab97540410145bb5";

const average = (arr) =>
  arr.reduce((acc, curr, i, arr) => acc + curr / arr.length, 0);

export default function App() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState(function () {
    const storedItems = localStorage.getItem("favorites");
    return JSON.parse(storedItems) || [];
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchData() {
        try {
          setIsLoading(true);
          setError("");

          const response = await fetch(
            `https://newsapi.org/v2/everything?q=${search}&apiKey=${API_KEY}`,
            { signal: controller.signal }
          );

          if (!response.ok) {
            throw new Error("An error occurred. Unable to fetch data.");
          }

          const data = await response.json();

          // if(data.Response === "False") {
          //   throw new Error("Data not found")
          // }

          const recentData = data.articles.slice(0, 10);
          setItems(recentData);
          setError("");
        } catch (error) {
          if (error.name !== "AbortError") {
            console.log(error);
            setError(error.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (search.length < 3) {
        setItems([]);
        setError("");
        return;
      }

      handleClose();
      fetchData();

      return function () {
        controller.abort();
      };
    },
    [search]
  );

  useEffect(
    function () {
      localStorage.setItem("favorites", JSON.stringify(favoriteItems));
    },
    [favoriteItems]
  );

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

  return (
    <>
      <NavBar>
        <Search search={search} onSearch={setSearch} />
        <SearchResults items={items} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <SearchList items={items} onSelected={handleSelected} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedItem ? (
            <ItemDetails
              favoriteItems={favoriteItems}
              selectedItem={selectedItem}
              onClose={handleClose}
              onAddItemToFavorites={handleAddItemToFavorites}
            />
          ) : (
            <>
              <Summary favoriteItems={favoriteItems} />
              <FavoriteItemList
                favoriteItems={favoriteItems}
                onSelected={handleSelected}
                onDeleteItemFromFavorites={handleDeleteItemFromFavorites}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <header className="logo">
      <h1>News Tracker</h1>
    </header>
  );
}

function Search({ search, onSearch }) {
  const searchRef = useRef(null);

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
    <input
      className="search"
      type="text"
      ref={searchRef}
      value={search}
      onChange={(e) => onSearch(e.target.value)}
      placeholder="Search by keyword..."
    />
  );
}

function SearchResults({ items }) {
  const numItems = items.length;
  return <p className="num-results">{numItems} results found</p>;
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? "-" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function SearchList({ items, onSelected }) {
  return (
    <ul className="list">
      {items.map((item) => (
        <Item
          key={crypto.randomUUID() + item.title}
          item={item}
          onSelected={onSelected}
        />
      ))}
    </ul>
  );
}

function Item({ item, onSelected }) {
  return (
    <li onClick={() => onSelected(item)}>
      <img src={item.urlToImage} alt={item.title} />
      <h2 style={{ fontSize: "1.2rem" }}>
        {item.title.substring(0, 50) + "..."}
      </h2>
      <div>
        <p>
          <span>By:</span>
          <span>{item.author}</span>
        </p>
      </div>
    </li>
  );
}

function FavoriteItemList({
  favoriteItems,
  onSelected,
  onDeleteItemFromFavorites,
}) {
  return (
    <ul className="list">
      {favoriteItems.map((item) => (
        <FavoriteItem
          key={crypto.randomUUID() + item.title}
          item={item}
          onSelected={onSelected}
          onDeleteItemFromFavorites={onDeleteItemFromFavorites}
        />
      ))}
    </ul>
  );
}

function FavoriteItem({ item, onSelected, onDeleteItemFromFavorites }) {
  return (
    <li onClick={() => onSelected(item)}>
      <img src={item.urlToImage} alt={item.title} />
      <h2>{item.title.substring(0, 70) + "..."}</h2>
      <div>
        <p>
          <span>⭐️</span>
          <span>{item.rating} rating</span>
        </p>
        {/* <p>
          <span>🌟</span>
          <span>{item.rating} user rating</span>
        </p> */}
        {/* <p>
          <span>⏳</span>
          <span>{item.content.length} characters</span>
        </p> */}
        <a href={item.url}>View Full Article</a>
        <button
          className="btn-delete"
          onClick={() => onDeleteItemFromFavorites(item.title)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function Summary({ favoriteItems }) {
  const numItems = favoriteItems.length;
  const avgRating = average(favoriteItems.map((item) => item.rating));
  const avgChars = average(
    favoriteItems.map(
      (item) =>
        Number(item.content.split("[")[1].split("+")[1].split(" ")[0]) + 214 // the api only returns the first 214 chars from each article
    )
  );
  console.log(favoriteItems.map((item) => item.content.split("")));
  // console.log(favoriteItems.map((item) => item.content.length));

  return (
    <div className="summary">
      <h2>Favorited Items</h2>
      <div>
        <p>
          <span style={{ fontSize: "1.75rem" }}>#️⃣</span>
          <span>{numItems} items</span>
        </p>
        <p>
          <span style={{ fontSize: "1.75rem" }}>⭐️</span>
          <span>{avgRating.toFixed(1)}</span>
        </p>
        {/* <p>
          <span>🌟</span>
          <span>user rating</span>
        </p> */}
        <p>
          {/* <span>⏳</span> */}
          <span style={{ fontSize: "1.75rem" }}>🔤</span>
          <span>{avgChars.toFixed(0)}</span>
        </p>
      </div>
    </div>
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

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const publishedAt = new Date(selectedItem.publishedAt).toLocaleDateString(
    "en-US",
    options
  );

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

  useEffect(
    function () {
      if (!selectedItem.title) return;

      document.title = `Article | ${selectedItem.title}`;

      return function () {
        document.title = "New Tracker";
      };
    },
    [selectedItem.title]
  );

  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onClose}>
          &larr;
        </button>
        <img src={selectedItem.urlToImage} alt={selectedItem.title} />
        <div className="details-overview">
          <h2>{selectedItem.title}</h2>
        </div>
      </header>
      <section>
        <div className="rating">
          {!isFavorite ? (
            <>
              <StarRating maxRating={5} size={24} onSetRating={setRating} />
              {rating > 0 && (
                <button
                  className="btn-add"
                  onClick={() =>
                    onAddItemToFavorites({ ...selectedItem, rating: rating })
                  }
                >
                  + Add to list
                </button>
              )}
            </>
          ) : (
            <p>You rated the current article {userRating} out of 5.</p>
          )}
        </div>
        <div className="details-summary">
          <span>
            <b>Written by:</b> {selectedItem.author}
          </span>
          <span>
            <b>Published by:</b> {selectedItem.source.name}
          </span>
          <span>
            <b>Published at:</b> {publishedAt}
          </span>
          <span>
            <b>Descrtiption:</b> {selectedItem.description}
          </span>
        </div>
        <a href={selectedItem.url}>Read Full Article</a>
      </section>
    </div>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
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
