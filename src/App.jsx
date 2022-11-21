/* eslint-disable no-unused-vars */
import axios from "axios";
import React from "react";
import styled from "styled-components";
import useLocalStorage from "use-local-storage";

//icons
import { BiSearch } from "react-icons/bi";
import { CopyIcon, CopiedIcon } from "./icons/icons";
import { BsArrowRight, BsArrowDown } from "react-icons/bs";

//components
import Icons from "./components/icons";
import Command from "./components/command";
import Suggestion from "./components/suggestion";
import Instruction from "./components/instruction";
import {
  bingAutoSuggest,
  getBingSearch,
  loadHyperBeam,
  openNewTab,
  renderPage,
  updateTab,
} from "./action/bingAction";

function App() {
  //theme data
  const defaultDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [theme, setTheme] = useLocalStorage(
    "theme",
    defaultDark ? "dark" : "light"
  );

  //local data
  const [tabs, setTabs] = React.useState([]);
  const [windowId, setWindowId] = React.useState(null);
  const [data, setData] = React.useState([]);
  const [value, setValue] = React.useState("");
  const [sites, setSites] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState([]);
  const [suggestionsActive, setSuggestionsActive] = React.useState(false);
  const [cursor, setCursor] = React.useState(0);
  const [render, setRender] = React.useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = React.useState(-1);
  const [underDomain, setUnderDomain] = React.useState(false);
  const [underDomainData, setUnderDomainData] = React.useState([]);
  const [spaceClicked, setSpaceClicked] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);

  //instructions
  const [one, setOne] = React.useState("");
  const [two, setTwo] = React.useState("");
  const [three, setThree] = React.useState("");
  const [four, setFour] = React.useState("");
  const [five, setFive] = React.useState("");
  const [hb, setHb] = React.useState(null);

  const [commands] = React.useState([
    {
      id: 1,
      name: "Clipboard History",
      icon: CopyIcon,
    },
    {
      id: 2,
      name: "Import extension",
      icon: CopiedIcon,
    },
    {
      id: 3,
      name: "Manage extension",
      icon: CopiedIcon,
    },
  ]);

  const switchTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  function hasWhiteSpace(s) {
    return /\s/g.test(s);
  }

  const underDomainSearch = (key) => {
    //not yet implemented, store data in underDomainData
  };

  const handleChange = async (e) => {
    setLoading(true);
    setValue(e.target.value.toLowerCase());

    if (e.nativeEvent.data === " ") {
      setTwo("Suggestions + stashed pages");
      setThree("Results");
      setFour("down");
      setCursor(-1);
      setUnderDomain(false);
    } else if (e.target.value.length > 0) {
      setOne("Hit space to sirch the web");
      setFour("down");
      setTwo("Pages");
      setThree("Domains");
      setCursor(0);
      setUnderDomain(true);
      underDomainSearch(e.target.value);
    } else {
      setOne("Type to Sirch the web");
      setTwo("Save current page");
      setThree("Suggestions");
      setFive("right");
    }

    if (hasWhiteSpace(e.target.value)) {
      // setSites([]);
      const sug = await bingAutoSuggest(e.target.value);
      setSuggestions(sug);
      setSuggestionsActive(true);
      await handleRenderPage(e.target.value);
    } else {
      companySuggest(e);
    }
  };

  const handleRenderPage = async (value) => {
    const data = await getBingSearch(value);
    setData(data);
    const tabs = await renderPage(hb, data, windowId);
    setTabs(tabs);
    setWindowId(tabs[0].windowId);
  };

  React.useEffect(() => {
    if (value.length === 0) {
      setSites([]);
      setOne("Type to Sirch the web");
      setTwo("Save current page");
      setFour("");
      setThree("Suggestions");
      setFive("right");
    }

    if (!hasWhiteSpace(value)) {
      setSpaceClicked(false);
    }

    if (hasWhiteSpace(value)) {
      setSpaceClicked(true);
    }
  }, [value]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  const handleTabUpdate = async (id) => {
    await updateTab(hb, id);
  };

  React.useEffect(() => {
    const container = document.getElementById("container");

    loadHyperBeam(container)
      .then((hyperbeam) => {
        setHb(hyperbeam);
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      hb && hb.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyPressed = (e) => {
    if (
      e.keyCode === 37 ||
      e.keyCode === 39 ||
      e.keyCode === 38 ||
      e.keyCode === 40
    ) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 40 && selectedSuggestion < suggestions.length - 1) {
      setSelectedSuggestion(selectedSuggestion + 1);
    }

    if (e.keyCode === 38 && selectedSuggestion > -1) {
      setSelectedSuggestion(selectedSuggestion - 1);
    }

    if (e.keyCode === 13 && cursor > -1) {
      console.log("we goo", sites[cursor]);
    }

    if (e.keyCode === 13 && selectedSuggestion > -1) {
      window.open(`${suggestions[selectedSuggestion]?.url}`, "__blank");
    }

    //user hits any character apart from arrow keys when in hyperbeam
    if (
      render &&
      (e.keyCode !== 40 ||
        e.keyCode !== 38 ||
        e.keyCode !== 37 ||
        e.keyCode !== 39)
    ) {
      setRender(false);
    }
  };

  React.useEffect(() => {
    if (spaceClicked) {
      setRender(true);
      setOne("Type to Sirch the web");
      setTwo("Upvote");
      setThree("Next result");
      setFour("up");
    }
  }, [cursor]);

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  React.useEffect(() => {
    if (sites.length === 0 && value.length === 0) {
      setLoading(false);
    }
  }, [sites, value.length]);

  return (
    <>
      <Container data-theme={theme}>
        {/* <label className="switch">
					<input type="checkbox" />
					<span className="slider round" onClick={switchTheme}></span>
				</label> */}
        <Icons
          sites={sites}
          tabs={tabs}
          data={data}
          loading={loading}
          handleRender={(id) => handleTabUpdate(id)}
          render={render}
          cursor={cursor}
          setCursor={(x) => {
            setCursor(x);
          }}
        />
        <div className="search">
          {!render && (
            <>
              <form className="input" onSubmit={handleSubmit}>
                {underDomain && sites?.length > 0 ? (
                  <div className="underDomain">
                    <img src={sites[cursor]?.logo} alt={sites[cursor]?.name} />
                  </div>
                ) : (
                  <BiSearch className="icon" />
                )}
                <input
                  type="text"
                  placeholder="Search here...."
                  value={value}
                  onKeyDown={handleKeyPressed}
                  onChange={handleChange}
                />
              </form>
              <div className="container">
                {underDomain ? (
                  <div className="section">
                    <div className="title">
                      <p>Found</p>
                    </div>
                    <div className="content">
                      <p>Nothing found in the selected site</p>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                {suggestionsActive && (
                  <div className="section">
                    <div className="title">
                      <p>Suggestions</p>
                    </div>
                    <div className="content">
                      {suggestions.length > 0 ? (
                        suggestions
                          .slice(0, 5)
                          .map((suggestion, index) => (
                            <Suggestion
                              suggestion={suggestion}
                              key={index}
                              selected={selectedSuggestion === index}
                              handleRenderPage={(query) =>
                                handleRenderPage(query)
                              }
                            />
                          ))
                      ) : (
                        <div className="para">
                          <p>No suggestions</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="section">
                  <div className="title">
                    <p>Commands</p>
                  </div>
                  <div className="content">
                    {commands.map((command) => (
                      <Command command={command} key={command?.id} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          <Instruction
            one={one}
            two={two}
            three={three}
            four={four}
            render={render}
            icon={five}
          >
            {five === "right" ? (
              <BsArrowRight className="icon" />
            ) : (
              <BsArrowDown className="icon" />
            )}
          </Instruction>
        </div>
      </Container>
      <div
        title="render"
        id="container"
        style={
          !render
            ? { height: "0vh", width: "0vw" }
            : { height: "100%", width: "100%" }
        }
      />
    </>
  );

  function companySuggest(e) {
    axios
      .get(
        `https://autocomplete.clearbit.com/v1/companies/suggest?query=${e.target.value.toLowerCase()}`,
        {}
      )
      .then((response) => {
        setSites(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

const Container = styled.div`
  width: 650px;
  /* height: auto; */
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
  position: absolute;
  top: 0;
  left: calc(50% - 650px / 2);

  .switch {
    display: inline-block;
    width: 60px;
    height: 34px;
    position: absolute;
    bottom: 5px;
    right: 10px;
    margin: 0 0 30px 0;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--icon);
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: var(--white);
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: var(--shadow);
  }

  input:focus + .slider {
    box-shadow: 0 0 1px var(--shadow);
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }

  .search {
    width: 650px;
    height: auto;
    background: var(--black);
    margin: 30px 0;
    border-radius: 10px;
    /* border: 3px solid var(--gray); */
    box-shadow: var(--shadow) 0px 10px 50px;
    display: flex;
    flex-direction: column;
    align-items: center;

    form {
      width: 98%;
      height: 50px;
      border-bottom: 1px solid var(--gray);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 0 10px 0;

      .icon {
        color: var(--text);
        font-size: 1.5em;
        margin: 10px;
      }

      .underDomain {
        width: 10%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        img {
          width: 50%;
        }
      }

      input {
        width: 95%;
        height: 100%;
        background: transparent;
        border: none;
        outline: none;
        color: var(--white);
      }
    }

    .container {
      width: 100%;
      height: 350px;
      overflow-y: scroll;
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .section {
      width: 100%;
      height: auto;
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      .title {
        width: 100%;
        height: 25px;

        p {
          color: var(--text);
          font-weight: 700;
        }
      }

      .content {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;

        .para {
          width: 100%;
          height: 25px;

          p {
            color: var(--text);
            font-weight: 700;
            text-align: center;
          }
        }
      }
    }
  }
`;

export default App;
