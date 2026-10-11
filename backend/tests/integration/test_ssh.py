from app.collectors.ssh_collector import execute_commands


IP_ADDRESS = "127.0.0.1"
USERNAME = "monitor"
PASSWORD = "monitor123"
PORT = 2222


def test_ssh_connection():
    results = execute_commands(
        ip_address=IP_ADDRESS,
        username=USERNAME,
        password=PASSWORD,
        commands=[
            "whoami",
        ],
        port=PORT,
        timeout=5,
        retries=3,
    )

    assert "whoami" in results
    assert results["whoami"] == USERNAME