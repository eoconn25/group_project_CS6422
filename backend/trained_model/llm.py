import requests
from typing import List, Dict
import os
import subprocess
import json

# DEPRECATED run "lms server start" in powershell - this will start an lmstudio process on port 1234

class SmartAss:
    def __init__(self, 
                 base_url=None, 
                 model='llama2:7b'):
        # perhaps implement threading to call CNN as well; threads = []; t1 = threading.Thread(target=self._llm)
        # initialize llm model -- local version
        #self.base_url = base_url
        #self.model = model

        # ollama backend within container
        self.base_url = base_url or os.getenv("OLLAMA_URL", "http://ollama:11434")
        self.model = model

        # we will want a conversation history to provide context for LLM, save previous chats, etc
        # defines it as alist of dictionaries, mapping strings to string
        self.conversation: List[Dict[str,str]] = []


    def reset(self):
        # just clears the conversation history
        self.conversation = []


    def add_message(self, role:str, content:str):
        # add a message/exchange to our conversation history
        self.conversation.append({'role': role, 'content': content})
    
    
    def prompt(self, prompt:str, temperature:float=0.7, max_tokens:int=512) -> str:
        # function to actually send a prompt to model and return response
        self.add_message('user', prompt)

        # call prompt engineering function
        messages = self.prompt_engineer(prompt)

        url = f'{self.base_url}/api/generate'

        # this delivers the prompt to the llm with full context
        turn = {
            'model': self.model,  # defines model
            'messages': messages,  # context/conversation history
            "stream": False
            #"temperature": temperature, # model params
            #"num_predict": max_tokens
        }

        # try to send this turn to the llm; report errors if failure
        try:
            '''result = subprocess.run(
                ["ollama", "run", self.model, "--json", json.dumps({"prompt": prompt})],
                capture_output=True,
                text=True,
                check=True
            )
            output = result.stdout
            data = json.loads(output)
            message = data.get('output', '')  # adjust based on CLI format
            self.add_message('assistant', message)
            return message'''
            response = requests.post(url, json=turn, timeout=180)
            response.raise_for_status()
            data = response.json()

            # extract llm response and add to conversation history
            message = data.get('response', '').strip()
            self.add_message('assistant', message)
            return message
        
            '''except subprocess.CalledProcessError as e:
            print("Ollama CLI error:", e.stderr)
            return "oh no, didnt work"'''
        
        except Exception as e:
            print(f'error: {e}')
            return 'oh no, didnt work'
        

    def prompt_engineer(self, prompt:str) -> List[Dict[str,str]]:
        messages = self.conversation + [
            {'role': 'system', 'content': 'You are an expert in flower symbolism and bouquet design'},
            {'role': 'user', 'content': prompt}
        ]
        return messages
        # retrieve context from db
        context = self.query_db(prompt)
        
        # prompt engineer, return updated prompt
        eng_prompt = f'{context}\n\nUser: Based on the above context, please answer the following. {prompt}'
        return [
            [{'role': 'system', 'content': 'You are an expert in flower symbolism and bouquet design'}]
            + self.conversation
            + [{'role': 'user', 'content': eng_prompt}]
        ]
    
    def query_db(self, species:str, color:str):
        # query sql db here for flower symbolism context
        pass


# test the class with a prompt!!
if __name__ == "__main__":
    smart_ass = SmartAss()  # instance of class

    # test prompt
    user_prompt = "Hello, can you tell me about roses and their symbolism?"
    response = smart_ass.prompt(user_prompt)

    # print response
    print("LLM response:")
    print(response)

    # test prompt
    user_prompt = "Can you elaborate on the pro ti pyou previously mentioned?"
    response = smart_ass.prompt(user_prompt)

    # print response
    print("LLM response:")
    print(response)

    

'''
# stuff for frontend - double check
# this is in the backend
from flask import Flask, request, jsonify
from llm_handler import LLMHandler

app = Flask(__name__)
llm = SmartAss()

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()  # get json from frontend
    prompt = data.get("prompt", "")
    reply = llm.prompt(prompt)  # prompt llm
    return jsonify({"response": reply})  # return json response to frontend

# this in the frontend js
fetch("/ask", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({prompt: "Explain rose symbolism"})
})'''