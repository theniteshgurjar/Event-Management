@echo off
echo Starting PostgreSQL database server...
"D:\pgsql\bin\pg_ctl.exe" start -D "D:\pgsql\data" -l "D:\pgsql\data\server.log"
echo.
echo Database server status:
"D:\pgsql\bin\pg_ctl.exe" status -D "D:\pgsql\data"
pause
