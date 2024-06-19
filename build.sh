#!/bin/bash

# Define the template files
head="src/components/head.html"
header="src/components/header.html"
footer="src/components/footer.html"

# Define the placeholder comments
head_placeholder="{head}"
header_placeholder="{header}"
footer_placeholder="{footer}"

# Define the input and output files
input_files=("src/index.html" "src/services/index.html" "src/contact/index.html")
output_dir="build"

# Remove the output directory if it exists
rm -rf $output_dir

# Create the output directory
mkdir -p $output_dir

# Loop over the input files
for input_file in "${input_files[@]}"; do
    # Get the directory path and filename
    dir_path=$(dirname $input_file)
    filename=$(basename $input_file)

    # Remove 'src/' from the directory path
    dir_path=${dir_path/src\//}

    # If dir_path is 'src', set it to an empty string
    if [ "$dir_path" == "src" ]; then
        dir_path=""
    fi

    # Create the same directory structure in the output directory
    mkdir -p "$output_dir/$dir_path"

    # Replace the placeholders with the template content and copy the file to the new directory
    sed -e "/$head_placeholder/r $head" -e "/$head_placeholder/d" \
        -e "/$header_placeholder/r $header" -e "/$header_placeholder/d" \
        -e "/$footer_placeholder/r $footer" -e "/$footer_placeholder/d" $input_file > "$output_dir/$dir_path/$filename"
done

# Copy non-HTML files from src to build
mkdir -p $output_dir/css
mkdir -p $output_dir/js
mkdir -p $output_dir/img
cp src/robots.txt $output_dir/robots.txt
cp src/sitemap.xml $output_dir/sitemap.xml
cp src/css/*.css $output_dir/css
cp src/js/*.js $output_dir/js
cp src/img/*.* $output_dir/img
