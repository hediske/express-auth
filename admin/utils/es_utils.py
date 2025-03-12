from elasticsearch import Elasticsearch
import click

# Connect to Elasticsearch (update the host/port as needed)
es = Elasticsearch(['http://localhost:9200'])




@click.group()
def cli():
    """CLI tool for interacting with Elasticsearch."""
    pass


@cli.command()
def check():
    """Check if Elasticsearch is running."""
    if es.ping():
        return ("UP", "✅ Connected to Elasticsearch")
    else:
        return ("DOWN", "❌ Could not connect to Elasticsearch")


@cli.command()
def list():
    """List all indexes in Elasticsearch."""
    try:
        indexes = es.indices.get_alias(index="*")
        if not indexes:
            print("No indexes found.")
        else:
            print("Indexes:")
            for index in indexes:
                print(f" - {index}")
    except Exception as ex:
        print("Error:", ex)


@cli.command()
def reset():
    """Delete all indexes in Elasticsearch."""
    try:
        indexes = es.indices.get_alias(index="*")
        if not indexes:
            print("No indexes to delete.")
        else:
            for index in indexes:
                es.indices.delete(index=index)
                print(f"Deleted index: {index}")
            print("All indexes have been reset.")
    except Exception as ex:
        print("Error:", ex)


if __name__ == "__main__":
    cli()
