XKCD 1286
=========

Based on the [comic strip](http://xkcd.com/1286/). A "tool" for exploring and solving passwords based on hints and inter-password shared character sequences.

I got bored with it though, since guessing passwords isn't that fun when you can't *really* know if you are right or wrong.

The code itself is pretty solid, but it is not in a really enduser-friendly state. 

Why?
----
For fun. That's how I roll.

How?
----
Handling 10 GiB of text was kind of tricky. I thought I could just dump it all in a relational database and play around with it from there, but it turns out 250 million rows with multiple joins was more than my laptop could handle with any reasonable speed.

I ended up distilling out only the data I needed with some bash scripting and minimal scripts to massage text streams. After throwing away the more uncommon passwords, that gave me a few hundred megabytes of password hints, and some 6 MiB of password frequency data. This preprocessing step takes about 2 hours, compared to over 24 hours to just import a CSV file into Postgres/MySQL.

The frequency data and solutions can easily be handled by a relational database, while the hints can easily be read from text files named by the password hash.

Isn't this a huge security risk?
--------------------------------
Not really. It was a long time ago, and the passwords aren't really difficult to guess manually, when there are hints like "drowssap backwards + 1".
