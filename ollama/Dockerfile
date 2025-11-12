# dockerfile to create a container housing our ollama llm
FROM ollama/ollama:latest
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

EXPOSE 11434
#ENTRYPOINT ["ollama", "serve"]
#RUN ollama pull llama2:7b
ENTRYPOINT ["/bin/sh", "-c", "ollama serve & sleep 5 && ollama pull llama2:7b && wait"]