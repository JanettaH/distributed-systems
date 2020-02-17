from bs4 import BeautifulSoup
import urllib.request
import json
from pathlib import Path
from queue import Queue
import re
from time import time, sleep
from threading import Thread
import sys
from flask import Flask
from flask import request
from flask import jsonify
from flask_cors import CORS
from flask import send_from_directory
from flask import render_template


class Page:
    def __init__(self, url, title, parent, depth=0):
        self.url = url
        self.title = title
        self.parent = parent
        self.depth = depth


def strip_url(url):
    return re.search(r"\/wiki\/(.+)$", url).group(1)


def link_is_valid(link):
    if link.get('href') and link.get('href')[:6] == "/wiki/":
        if (link.contents and str(link.contents[0])[0] != "<"
                and ":" not in link.get('href')):
            return True
    return False


def get_connection(page, connections):
    connections.append((page, urllib.request.urlopen(
        "https://en.wikipedia.org/wiki/" + page.url)))


def get_links_from_page(page, connection):
    print(" -> ".join([r[1] for r in build_path(page)]))
    links = []
    soup = BeautifulSoup(connection, "lxml").find(
        "div", {"id": "mw-content-text"})
    # exlude "references" section
    for div in soup.find_all("div", {'class': 'reflist'}):
        div.decompose()
    for div in soup.find_all("div", {'class': 'navbox'}):
        div.decompose()
    for div in soup.find_all("div", {'class': 'refbegin'}):
        div.decompose()
    for paragraph in soup.findAll('p'):
        for link in paragraph.findAll('a'):
            if link_is_valid(link):
                links.append(link)
    for list in soup.findAll('ul'):
        for link in list.findAll('a'):
            if link_is_valid(link):
                links.append(link)
    return [(a.get('href')[6:], a.contents[0]) for a in links]

def build_path(current):
    path = []
    while current.parent:
        path.append((current.url, current.title))
        current = current.parent
    path.append((current.url, current.title))
    path.reverse()
    return path


def check_links(links, visited, queue, goal_suffix, page):
    for url, title in links:
        if url not in visited:
            if url == goal_suffix:
                p = build_path(page)
                p.append((url, title))
                return p
            visited.add(url)
            queue.put(Page(url, title, page, page.depth + 1))
    return None


def relate(start, destination):
    cache = dict()
    visited = set()
    q = Queue()
   
    q.put(Page(strip_url(start), strip_url(start), None))
    goal_suffix = strip_url(destination)
    current_depth = 0
   
    web_links = []
    while True:
       
        if not q.empty():
            page = q.get()

       
        if q.empty() or page.depth > current_depth:
            print("checking {} links on level {}".format(
                len(web_links), current_depth))
           
            if not q.empty():
                current_depth += 1


            while web_links:
                connections = []
                threads = []
                for i in range(100):
       
                    if web_links:
                        t = Thread(target=get_connection, args=(
                            web_links.pop(), connections))
                        threads.append(t)
                        t.start()

                for i in range(len(threads)):
                    threads[i].join()

                for connection in connections:
                    links = get_links_from_page(connection[0], connection[1])
                    cache[connection[0].url] = links
                    result = check_links(
                        links, visited, q, goal_suffix, connection[0])
                    if result:
                        return result
                if web_links:
                    print("{} links left to check...".format(len(web_links)))
            #tyhjennetään linkkilista
            web_links = []

        if page.url in cache:
            links = cache[page.url]
        # käsittelyssä oleva sivu lisätään kyseisen tason linkkeihin
        else:
            web_links.append(page)
            continue
        result = check_links(links, visited, q, goal_suffix, page)
        if result:
            return result


app = Flask(__name__, static_folder='frontend/build/static', template_folder="frontend/build")
CORS(app)

@app.route('/')
def serve_react_app():
    return render_template('index.html')

@app.route('/route', methods=['POST'])
def fetch_route():
    try:
        start_link = request.json.get('start_link')
        dest_link = request.json.get('dest_link')
        result = relate(start_link, dest_link)
        if result:
            return jsonify(" -> ".join([r[1] for r in result]))
        else:
            return jsonify("solution not found")
    except:
        return jsonify('an error occurred')


app.run(debug=True, host='0.0.0.0')