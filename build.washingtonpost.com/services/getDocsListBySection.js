import fs from "fs";
import globby from "globby";
import matter from "gray-matter";

const cache = new Map();

export const getAllDocs = async () => {
  let posts = null;

  if (cache.has("all")) {
    posts = cache.get("all");
    cache.delete("all");
  } else {
    const files = await globby("docs/**/*.mdx");
    posts = await Promise.all(
      files.map(async (file) => {
        const fileData = fs.readFileSync(file);
        const slug = `/${file.replace(/\.mdx?$/, "").replace("docs/", "")}`;
        const frontMatter = matter(fileData);

        return {
          content: frontMatter.content,
          data: frontMatter.data,
          slug,
          filePath: file,
        };
      })
    );

    // add to cache
    cache.set("all", posts);
  }

  return posts;
};

// returns an array of document objects
export const getDocsListBySection = async (input) => {
  let posts = null;

  if (cache.has(input)) {
    posts = cache.get(input);
    cache.delete(input);
  } else {
    const files = await globby(`docs/${input}/**/*.mdx`);
    posts = await Promise.all(
      files.map(async (file) => {
        const fileData = fs.readFileSync(file);

        const slug = `/${file.replace(/\.mdx?$/, "").replace("docs/", "")}`;
        const frontMatter = matter(fileData);

        return {
          content: frontMatter.content,
          data: frontMatter.data,
          slug,
          filePath: file,
        };
      })
    );

    // add to cache
    cache.set(input, posts);
  }

  return posts;
};

export const getResources = async (input) => {
  const posts = await globby(`docs/${input}/**/*.mdx`);

  const docs = posts.map((filePath) => {
    const source = fs.readFileSync(filePath);
    const slug = `/${filePath.replace(/\.mdx?$/, "").replace("docs/", "")}`;
    const { content, data } = matter(source);
    return {
      content,
      data,
      filePath,
      slug,
    };
  });

  return docs;
};
