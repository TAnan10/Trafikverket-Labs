import React, { useState } from "react";
import "./App.css";
import Sidebar from "./components/sidebar/sidebar";
import TrainList from "./components/trainlist/trainlist";
import Header from "./components/header/header";
import SearchForm from "./components/searchform/searchform";

function App() {
  const [isSearchClicked, setIsSearchClicked] = useState(false);

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <Header />
        <SearchForm onSearch={() => setIsSearchClicked(true)} />
        {isSearchClicked && <TrainList />}
      </div>
    </div>
  );
}

export default App;
