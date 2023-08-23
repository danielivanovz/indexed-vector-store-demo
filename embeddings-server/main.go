package main

import (
	"log"
	"net/http"
	"time"

	"github.com/rs/cors"
)

func logMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("[%s] %s %s %s", time.Now().Format(time.RFC3339), r.RemoteAddr, r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

func main() {
	fs := http.FileServer(http.Dir("files"))
	loggedFs := logMiddleware(fs)
	corsHandler := cors.Default().Handler(loggedFs)

	port := "8080"
	log.Printf("Serving files on http://localhost:%s", port)
	err := http.ListenAndServe(":"+port, corsHandler)
	if err != nil {
		log.Printf("Error serving files: %s", err)
		log.Fatal(err)
	}
}
