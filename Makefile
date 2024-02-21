build:
	docker build -t artbuildbot .


run:
	docker run -d -p 3000:3000 --name artbuildbot --rm artbuildbot