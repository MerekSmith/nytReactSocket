import React, { Component } from "react";
import socketIOClient from 'socket.io-client'
import Jumbotron from "../../components/Jumbotron";
import API from "../../utils/API";
import { Link } from "react-router-dom";
import { Col, Row, Container } from "../../components/Grid";
import { List, ListItem, NoteItem } from "../../components/List";
import { Input, FormBtn } from "../../components/Form";
import SaveBtn from "../../components/SaveBtn";
import RemoveBtn from "../../components/RemoveBtn";

class Articles extends Component {

	// socket.io
	constructor(props) {
		super(props);
		this.state = {
			articles: [],
			topic: "Trump",
			startYear: "2015",
			endYear: "2018",
			savedArticles: [],
			timer: 'no timer yet'
		};



		// socket io is on listening for when an alert comes from the server side.
		const socket = socketIOClient('')
		socket.on('alert', data => alert('New article has been saved:\n' + data));

		socket.on('countdown', (timer) => this.setState({timer: timer}));

	}

	
	// method for emitting a socket.io event
	send = (article) => {
		const socket = socketIOClient()
		// When an article is saved, the article title is send to the server which then triggers an alert emit back to all clients.
		socket.emit('article saved', article);
	}




	componentDidMount() {
		this.loadArticles();
	}




	loadArticles = () => {
		API.getArticles()
			.then(res =>
				this.setState({ savedArticles: res.data })
			)
			.catch(err => console.log(err));
	};

	deleteArticle = id => {
		API.deleteArticle(id)
			.then(res => this.loadArticles())
			.catch(err => console.log(err));
	};

	handleInputChange = event => {
		const { name, value } = event.target;
		this.setState({
			[name]: value
		});
	};

	handleSearchSubmit = event => {
		event.preventDefault();
		API.searchArticles({
			topic: this.state.topic,
			startYear: this.state.startYear,
			endYear: this.state.endYear
		})
			.then(res => {
				this.setState({
					articles: res.data.response.docs, topic: "", startYear: "", endYear: ""
				})
			});
	};

	handleSave = index => {
		// event.preventDefault();
		API.saveArticle({
			title: this.state.articles[index].headline.main,
			url: this.state.articles[index].web_url,
			date: this.state.articles[index].pub_date,
			snippet: this.state.articles[index].snippet
		})
			.then(res => this.loadArticles())
			.catch(err => console.log(err));
		// Remove saved article from API array
		let article = this.state.articles[index].headline.main;
		let newArray = this.state.articles;
		newArray.splice(index, 1);
		this.setState({
			articles: newArray
		});
		this.send(article);
	};

	render() {
	
		return (
			<Container fluid>
				<Row>
					<Col size="md-1">
					</Col>
					<Col size="md-10">
						<Jumbotron>
							<p className="socket-intro">
								Socket countdown timer example: {this.state.timer}
							</p>
							<h1>Search</h1>

							<form>
								<Input
									value={this.state.topic}
									onChange={this.handleInputChange}
									name="topic"
									placeholder="Topic (required)"
								/>
								<Input
									value={this.state.startYear}
									onChange={this.handleInputChange}
									name="startYear"
									placeholder="Start Year (required)"
								/>
								<Input
									value={this.state.endYear}
									onChange={this.handleInputChange}
									name="endYear"
									placeholder="End Year (required)"
								/>
								<FormBtn
									disabled={!(this.state.topic && this.state.startYear && this.state.endYear)}
									onClick={this.handleSearchSubmit}
								>
									Search
              </FormBtn>
							</form>
						</Jumbotron>
					</Col>
				</Row>

				<Row>
					<Col size="md-1">
					</Col>
					<Col size="md-10">
						<List>
							<h1 style={{ textAlign: "center" }}>Search Results:</h1>
							{this.state.articles.map((article, index) => (
								<ListItem key={index}>
									{/* <img src={article.web_url + article.multimedia[3].url} /> */}
									<Link to={article.web_url}>
										<strong>
											Title: {article.headline.main}
										</strong> <br />
										Snippet: {article.snippet}
										<br />
										Posted Date: {article.pub_date}
									</Link>
									<SaveBtn onClick={() => this.handleSave(index)} />
								</ListItem>
							))}
						</List>
					</Col>
				</Row>

				<br />

				<Row>
					<Col size="md-1">
					</Col>
					<Col size="md-10">
						<List>
							<h1 style={{ textAlign: "center" }}>Saved Articles</h1>
							{this.state.savedArticles.map((saved, index) => (
								<ListItem key={index}>
									{/* <img src={article.web_url + article.multimedia[3].url} /> */}
									<Link to={"/articles/" + saved._id}>
										<strong>
											Title: {saved.title}
										</strong> <br />
										URL: {saved.url}
										<br />
										Posted Date: {saved.date}
									</Link>
									<RemoveBtn onClick={() => this.deleteArticle(saved._id)} />
									<NoteItem>
										Note: {saved.note}
									</NoteItem>
								</ListItem>
							))}
						</List>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default Articles;

