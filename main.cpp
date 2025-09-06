#define _WIN32_WINNT 0x0A00   // Windows 10
#include "httplib.h"
#include "nlohmann/json.hpp"

#include <iostream>
#include <string>
#include <vector>
#include <mutex>
#include <set>

struct Note {
    int id;
    std::string title;
    std::string content;
    std::string color;
};

static std::vector<Note> notes = {
    {1, "test note 1", "bla bla note1", "color-yellow"},
    {2, "test note 2", "bla bla note2", "color-blue"},
    {3, "test note 3", "bla bla note3", "color-green"},
    {4, "test note 4", "bla bla note4", "color-red"},
    {5, "test note 5", "bla bla note5", "color-pink"},
    {6, "test note 6", "bla bla note6", "color-purple"}
};
static std::mutex notes_mutex;

// Simple origin whitelist. Use "*" to allow all origins.
static const std::set<std::string> allowed_origins = {
    "http://localhost:3000",
    "http://127.0.0.1:3000"
};

static std::string choose_allow_origin(const httplib::Request& req) {
    auto it = req.headers.find("Origin");
    if (it == req.headers.end()) return std::string();

    const std::string origin = it->second;
    if (allowed_origins.find("*") != allowed_origins.end()) return "*";
    if (allowed_origins.find(origin) != allowed_origins.end()) return origin;
    return std::string();
}

static void set_cors_headers(const httplib::Request& req, httplib::Response& res, bool allow_credentials = false) {
    std::string allow_origin = choose_allow_origin(req);
    if (allow_origin.empty()) return;

    res.set_header("Access-Control-Allow-Origin", allow_origin);

    if (allow_credentials) {
        if (allow_origin != "*") {
            res.set_header("Access-Control-Allow-Credentials", "true");
        }
    }

    res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.set_header("Access-Control-Max-Age", "3600");
}

int main() {
    httplib::Server svr;

    // Use Headers map overload (older cpp-httplib compatibility)
    httplib::Headers default_headers = {
        { "Server", "cpp-httplib" },
        { "Content-Type", "application/json; charset=utf-8" }
    };
    svr.set_default_headers(default_headers);

    // Generic preflight handler for any path.
    svr.Options(".*", [](const httplib::Request& req, httplib::Response& res) {
        set_cors_headers(req, res, /*allow_credentials=*/true);
        res.status = 204; // No Content
    });

    svr.Get("/api/notes", [](const httplib::Request& req, httplib::Response& res) {
        set_cors_headers(req, res, /*allow_credentials=*/true);

        nlohmann::json j = nlohmann::json::array();
        {
            std::lock_guard<std::mutex> lk(notes_mutex);
            for (const auto& n : notes) {
                j.push_back({
                    {"id", n.id},
                    {"title", n.title},
                    {"content", n.content},
                    {"color", n.color}
                });
            }
        }
        res.set_content(j.dump(2), "application/json");
    });

    svr.Get("/hi", [](const httplib::Request& req, httplib::Response& res) {
        set_cors_headers(req, res, /*allow_credentials=*/true);
        res.set_content("Hello World!", "text/plain");
    });

    svr.Get("/json", [](const httplib::Request& req, httplib::Response& res) {
        set_cors_headers(req, res, /*allow_credentials=*/true);
        const char* body = R"({
            "message": "Hello World",
            "ok": true,
            "count": 1
        })";
        res.set_content(body, "application/json");
    });

    std::cout << "Starting HTTP server on 0.0.0.0:5000\n";
    if (!svr.listen("0.0.0.0", 5000)) {
        std::cerr << "Error: failed to start HTTP server\n";
        return 1;
    }
    return 0;
}
