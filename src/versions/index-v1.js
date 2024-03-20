import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// import App from "./App";
import StarRating from "./StarRating";

function Test() {
  const [rating, setRating] = useState(0);

  return (
    <div>
      <StarRating
        maxRating={10}
        color="pink"
        size={18}
        onSetRating={setRating}
      />
      <StarRating
        maxRating={5}
        color="purple"
        size={24}
        messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
        onSetRating={setRating}
      />
      ;<p>The current rating is {rating}.</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <StarRating />
    <Test />
  </React.StrictMode>
);
