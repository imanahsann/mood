# Prep dropbox to ignore 'node_modules' in a node project
# 1. Move this script to your node project root;
# 2. Delete the existing 'node_modules' folder;
# 3. Run this script;
# 4. `npm install` as normal;
# 5. Enjoy!

tell application "Finder"
  set current_path to container of (path to me) as alias
  make new folder at current_path with properties {name:"node_modules"}
  set current_path to POSIX path of current_path
end tell

delay 1

# do shell script "xattr -w com.dropbox.ignored 1 " & current_path & "./node_modules"
do shell script "xattr -w com.dropbox.ignored 1 " & quoted form of (POSIX path of current_path) & "./node_modules"