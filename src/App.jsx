import { useState, useEffect } from "react";
import { nanoid } from "nanoid";

function App() {
	const [countries, setCountries] = useState([]);
	const [selectedCountry, setSelectedCountry] = useState(countries[0]?.name?.common || "");
	const [selectedCountries, setSelectedCountries] = useState([]);
	const [state, setState] = useState({
		loading: false,
		loadingModal: false,
		error: false,
		errorMessage: "",
		resetBtn: false,
		reset: false,
	});

	const initialState = () => {
		setCountries([]);
		setSelectedCountries([]);
		setSelectedCountries([]);
		setState({
			loading: false,
			loadingModal: false,
			error: false,
			errorMessage: "",
			resetBtn: false,
			reset: false,
		});
	};

	useEffect(() => {
		initialState();
		setState({ loading: true });
		const fetchCountries = async () => {
			const response = await fetch("https://restcountries.com/v3.1/all?fields=name,flags,cca3");
			const data = await response.json();
			if (!response.ok) {
				throw new Error("");
			} else {
				const randomCountries = data.sort(() => Math.random() - Math.random()).slice(0, 4);
				// const randomCountryName = randomCountries.map((country) => country.name.common);
				// const randomCountryFlag = randomCountries.map((country) => country.flags.png);
				// const randomCountryCode = randomCountries.map((country) => country.cca3);
				console.log(randomCountries, "random Countries");
				{
					randomCountries.map((country) => {
						setCountries((prevCountries) => [
							...prevCountries,
							{
								id: nanoid(),
								name: country.name.common,
								flag: country.flags.png,
								countryCode: country.cca3,
							},
						]);
					});
				}
			}
		};
		fetchCountries();
		setState({ loading: false });
	}, [state.reset]);

	console.log(countries, "countries");
	const handleCountrySelect = (e) => {
		const selectedCountry = e.target.value;
		const countryCode = countries.filter((item) => item.name === selectedCountry).map((item) => item.countryCode);
		const countryName = countries.map((item) => item.name);
		const selectedCountryFlag = countries.map((item) => item.flag);
		console.log(countryCode, "countryCode");
		const fetchGdp = async () => {
			const apiUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json`;
			const response = await fetch(apiUrl);
			if (!response.ok) {
				setState({ error: true, errorMessage: "Error: Country GDP not found" });
				setTimeout(() => {
					setState({ error: false, errorMessage: "" });
				}, 3000);
			} else {
				try {
					const data = await response.json();
					console.log(data, "data");
					const gdpData = data[1][0]["value"];
					const formatCurrency = new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "USD",
					}).format(gdpData);
					if (countryName === selectedCountry) {
						setState({ error: true, errorMessage: "Error: Country already selected" });
					} else if (selectedCountries.length > 4) {
						setState({ error: true, errorMessage: "Error: You can only select 4 countries", resetBtn: true });
					} else {
						setSelectedCountries((prevSelectedCountries) => [
							...prevSelectedCountries,
							{
								// countryCode: countryCode,
								// name: selectedCountry,
								// flag: selectedCountryFlag,
								gdp: formatCurrency,
							},
						]);
					}
				} catch (error) {
					setState({ error: true, errorMessage: "Error: Country GDP not found" });
					setTimeout(() => {
						setState({ error: false, errorMessage: "" });
					}, 3000);
				}
			}
		};
		fetchGdp();
		setState({ ...state, renderSelection: true });
	};

	const handleReset = () => {
		setState({ reset: true });
	};

	return (
		<div className='country-container-main'>
			<h1> Country Interview Test</h1>
			<div className='country-container'>
				<select onChange={handleCountrySelect} value={selectedCountry} className='country-list'>
					<option value=''>Please select one</option>
					{state.loading ? <p>Loading...</p> : ""}
					{countries.map((country) => {
						return (
							<option key={country.id} value={country.name} className='country-option'>
								{country.name}
							</option>
						);
					})}
				</select>
				{state.error ? (
					<div className='error-container'>
						<div className='error-content'>
							<p className='error-message'>{state.errorMessage}</p>
						</div>
					</div>
				) : (
					""
				)}
				{selectedCountries.map((country) => {
					return (
						<div key={country.id} className='selected-country-container-list'>
							<div className='country-info-container'>
								<>
									<img className='country-flag-img' src={country.flag} />
									<h4 className='country-name'>{country.name}</h4>
								</>
								<>
									<h4 className='country-text'>{country.gdp}</h4>
								</>
							</div>
						</div>
					);
				})}
			</div>
			{state.reset ? (
				<button className='reset-btn' onClick={handleReset}>
					Reset Countries
				</button>
			) : (
				""
			)}
		</div>
	);
}

export default App;
