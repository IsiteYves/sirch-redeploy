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
	const defaultDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const [theme, setTheme] = useLocalStorage(
		"theme",
		defaultDark ? "dark" : "light"
	);

	const [tabs, setTabs] = React.useState([]);
	const [windowId, setWindowId] = React.useState(null)
	const [data, setData] = React.useState([]);
	const [value, setValue] = React.useState("");
	const [sites, setSites] = React.useState([]);
	const [loading, setLoading] = React.useState(false);
	const [suggestions, setSuggestions] = React.useState([]);
	const [suggestionsActive, setSuggestionsActive] = React.useState(false);
	const [cursor, setCursor] = React.useState(0);
	//instructions
	const [one, setOne] = React.useState("");
	const [two, setTwo] = React.useState("");
	const [three, setThree] = React.useState("");
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
	const handleChange = async (e) => {
		setLoading(true);
		setValue(e.target.value.toLowerCase());

		if (hasWhiteSpace(e.target.value)) {
			setSites([]);
			const sug = await bingAutoSuggest(e.target.value);
			setSuggestions(sug);
			setSuggestionsActive(true);
			await handleRenderPage(e.target.value);
		} else {
			companySuggest(e);
		}

		if (e.nativeEvent.data === " ") {
			setTwo("Google SERP");
			setThree("Results");
			setFive("right");
		} else if (e.target.value.length > 0) {
			setTwo("Go to domain");
			setThree("Pages");
			setFive("down");
		} else {
			setOne("Sirch the web");
			setTwo("Save current page");
			setThree("Suggestions");
			setFive("right");
		}
	};

	const handleRenderPage = async (value) => {
		const data = await getBingSearch(value);
		setData(data);
		const tabs = await renderPage(hb, data, windowId);
		await updateTab(hb, tabs[0].id);
		setTabs(tabs);
		setWindowId(tabs[0].windowId)
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(false);
		if (hasWhiteSpace(value)) {
			await handleRenderPage(value);
			setSuggestionsActive(false);
		} else {
			openNewTab(undefined, undefined, sites[cursor].domain);
		}
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

	React.useEffect(() => {
		if (sites.length === 0 && value.length === 0) {
			setLoading(false);
		}
	}, [sites, value.length]);
	return (
		<>
			<Container data-theme={theme}>
				<label className="switch">
					<input type="checkbox" />
					<span className="slider round" onClick={switchTheme}></span>
				</label>

				<Icons
					sites={sites}
					tabs={tabs}
					data={data}
					loading={loading}
					handleRender={(id) => handleTabUpdate(id)}
					cursor={cursor}
					setCursor={(x) => {
						setCursor(x);
					}}
				/>

				<div className="search">
					<form className="input" onSubmit={handleSubmit}>
						<BiSearch className="icon" />
						<input
							type="text"
							placeholder="Search here...."
							value={value}
							onChange={handleChange}
						/>
					</form>
					{suggestionsActive && (
						<div className="section">
							<div className="title">
								<p>Suggestions</p>
							</div>
							<div className="content">
								{suggestions.length > 0 ? (
									suggestions.map((suggestion, index) => (
										<Suggestion
											suggestion={suggestion}
											key={index}
											handleRenderPage={(query) => handleRenderPage(query)}
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
					<Instruction one={one} two={two} three={three} icon={five}>
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
					tabs.length === 0
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
	width: max-content;
	/* padding: 50px 0; */
	/* background: var(--black); */
	display: flex;
	flex-direction: column;
	align-items: center;
	position: absolute;
	left:25%;
	z-index: 1000;
	.switch {
		/* position: relative; */
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

			input {
				width: 95%;
				height: 100%;
				background: transparent;
				border: none;
				outline: none;
				color: var(--white);
			}
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
