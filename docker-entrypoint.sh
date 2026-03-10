#!/bin/sh

# Replace the placeholder in the index.html file with the actual environment variable
if [ -n "$DATABASE_URL" ]; then
  echo "Injecting DATABASE_URL into index.html"
  sed -i "s|__VITE_DATABASE_URL__|$DATABASE_URL|g" /usr/share/nginx/html/letter_to_self/index.html
fi

# Execute the original CMD
exec "$@"
