
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/311/badge)](https://bestpractices.coreinfrastructure.org/projects/311)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d057d3f46f2b4cada7ab7ca9a1a2fe94)](https://www.codacy.com/app/baseio/who-tobaccoplaybook?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=tobaccoplaybook/site&amp;utm_campaign=Badge_Grade)/baseio/who-fctc-stories)
[![Codacy grade](https://img.shields.io/codacy/grade/d057d3f46f2b4cada7ab7ca9a1a2fe94.svg?maxAge=25)]()



# Tobacco Playbook

While the tobacco industry and its allies have always opposed tobacco control measures, their strategies have now become more determined, focussed, misleading, aggressive and sophisticated.
 
Until now there has been no single source explaining how tobacco industry players act and how governments and the public health community can respond to their arguments.
 
The **Tobacco Control Playbook** is a living collection of evidence-based arguments and responses, developed by tobacco control leaders to counteract and succeed against the tobacco industry.

[Read more...](https://tobaccoplaybook.net/en/introduction.html)


## Authoring

Create content as Markdown files in `articles/`, with frontmatter and footnotes

### Document structure

Each page/document

#### Naming convention

{root}/articles/`language`/`000`_name_of_this_page.md, where:  
- `language` is a directory containing all content files for a given language (e.g. 'en')  
- `000` denotes a *unique* page ID


Examples:  

/articles/en/001_page_number_one.md  
/articles/en/002_page_number_two.md  
/articles/no/001_side_nummer_en.md  
/articles/no/002_side_nummer_to.md  


#### Frontmatter


| Key           | Description | 
| ------------- | ----------- |
| Title         | the title of the argument |
| Authors       | one or all document authors |
| ApprovedBy    | the name (and position?) of the person who has approved the publishing of this document |
| ApprovedDate  | date, used internally for version control |
| Revision      | version number (please increment each time the document is updated/changed) |
| PublicDate    | date on which this document will be published on the website (and displayed across the website) |
| HeaderImage   | the URL to an image you like from unsplash.com |
| Tags          | keywords for this document |
| Short         | twitter-friendly super condensed summary |
| SourceFile    | filename of this document |
| ReferenceAccessDate | date, when the references was last checked |
| ArgumentId | informal ID, displayed in the index listing  |


## Building the site

```
$ npm install
$ npm start
```
This will install the dependencies and start the dev server, which
- Rebuilds the site into `build/`
- Starts a live-reload server (so you can browse the result) at http://127.0.0.1:8989/
- Starts a file wathcer, that rebuilds when sourcefiles change.

### Git Setup:
We follow the "gh-pages as a submodule of master" pattern from
http://blog.blindgaenger.net/generate_github_pages_in_a_submodule.html

so,
- work in master,
- generate the public files to _site/
- commit and push _site:
- `$ cd _site; git add .; git commit -m "site update"; git push origin gh-pages`
- commit and push master:
- `$ cd ../; git commit -a -m "site update"; git push origin master`


## Publishing the site

The git workflow is automated in `up.sh`, so simply run  `$ ./up.sh` (in repo root) to publish the content of `build/` to gh-pages.
