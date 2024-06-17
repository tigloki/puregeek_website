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
input_files=("src/index.html" "src/services.html" "src/contact.html")
output_dir="build"

# Remove the output directory if it exists
rm -rf $output_dir

# Create the output directory
mkdir -p $output_dir

# Loop over the input files
for input_file in "${input_files[@]}"; do
    # Get the filename without the directory
    filename=$(basename $input_file)

    # Replace the placeholders with the template content
    sed -e "/$head_placeholder/r $head" -e "/$head_placeholder/d" \
        -e "/$header_placeholder/r $header" -e "/$header_placeholder/d" \
        -e "/$footer_placeholder/r $footer" -e "/$footer_placeholder/d" $input_file > "$output_dir/$filename"
done

# Copy non-HTML files from src to build
mkdir -p $output_dir/css
mkdir -p $output_dir/js
mkdir -p $output_dir/img
cp src/css/*.css $output_dir/css
cp src/js/*.js $output_dir/js
cp src/img/*.* $output_dir/img
