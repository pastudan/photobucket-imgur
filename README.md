This code converts photobucket URLs on your forum to Imgur URLs. It does so by connecting to your DB, finding all photobucket URLs, re-uploading them to Imgur, and replacing your forum's raw db records.

Since this connects directly to your forum's database, this is potentially dangerous. ⚠️⚠️**Make database backups and don't try this unless you fully understand the code and what it's doing**.⚠️⚠️ I also make no guarantee that by running this code you are operating within PhotoBucket or Imgur's TOS. Please read those carefully and decide for yourself.

To get started, first `yarn`, then find all your forum posts that have photobucket URLs and export them to a text file. The file format (txt, csv, tsv, etc) doesn't really matter since we are just running a regular expression across the whole file to find exact URLs.

_example for a XenForo forum db:_

```sql
SELECT message FROM xf_post WHERE message LIKE '%photobucket%' INTO OUTFILE 'posts.txt';
```

Now, run `IMGUR_CLIENT_ID=clientId node convert.js`, replacing `clientId` with your Imgur API Client-ID, [obtained here](https://api.imgur.com/oauth2/addclient). This script will open 10 parallel connections which stream the images from photobucket and pipe them to imgur. This script creates a new file 'uploaded-images.json' which stores your photobucket -> imgur mapping. It also contains deletehashes which allow you to delete an image from Imgur should you need to in the future. **Put this file somewhere safe.**

Now, run `HOST=mysql_host USER=mysql_user PASS=mysql_pass DATABASE=dbname node replace.js`, replacing the environment variable vales with your database credentials. If not using XenForo forums, your will need to also set `TABLE`, `CONTENT_COLUMN`, and `ID_COLUMN` to reflect how these are stored by your forum software. This script will scan your db and update the records according to the mapping file.