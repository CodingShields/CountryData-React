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
				setCountries(randomCountries);
			}
		};
		fetchCountries();
		setState({ loading: false });
	}, []);

	const handleCountrySelect = (e) => {
		const selectedCountry = e.target.value;
		const selectedCountryId = e.target.selectedIndex;
		const selectedCountryFlag = countries.find((country) => country.name.common === selectedCountry).flags.png;
		const countryCode = countries.find((country) => country.name.common === selectedCountry).cca3;
		const fetchGdp = async () => {
			const apiUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json`;
			const response = await fetch(apiUrl);
			if (!response.ok) {
				setState({ error: true, errorMessage: "Error: Country GDP not found" });
			} else if (response.ok) {
				const data = await response.json();
				const gdpData = data[1][0]["value"];
				const formatCurrency = new Intl.NumberFormat("en-US", {
					style: "currency",
					currency: "USD",
				}).format(gdpData);
				if (selectedCountryId === countryId) {
					setState({ error: true, errorMessage: "Error: Country already selected" });
				} else if (selectedCountries.length === 4) {
					setState({ error: true, errorMessage: "Error: You can only select 4 countries" });
				} else {
					setSelectedCountries((prevSelectedCountries) => [
						...prevSelectedCountries,
						{
							id: countryId,
							countryCode: countryCode,
							name: selectedCountry,
							flag: selectedCountryFlag,
							gdp: formatCurrency,
							selected: true,
						},
					]);
				}
			}
		};
		fetchGdp();
		setState({ ...state, renderSelection: true });
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
							<option key={country.id} value={country.name.common} className='country-option'>
								{country.name.common}
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
		</div>
	);
}

export default App;
