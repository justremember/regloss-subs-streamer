WITH cte AS (
    SELECT id
    FROM
    (
        SELECT
            id,
            name,
            subcount,
            timestamp,
            timestamp_hour,
            SUM(subcount) OVER (PARTITION BY timestamp_hour) AS subs_total,
            COUNT() OVER (PARTITION BY timestamp_hour) AS total_count,
            ROW_NUMBER() OVER (PARTITION BY timestamp_hour) AS row_number,
            COUNT(CASE WHEN name = "ririka" THEN 1 ELSE null END) OVER (PARTITION BY timestamp_hour) AS ririka_count,
            COUNT(CASE WHEN name = "ao" THEN 1 ELSE null END) OVER (PARTITION BY timestamp_hour) AS ao_count,
            COUNT(CASE WHEN name = "kanade" THEN 1 ELSE null END) OVER (PARTITION BY timestamp_hour) AS kanade_count,
            COUNT(CASE WHEN name = "hajime" THEN 1 ELSE null END) OVER (PARTITION BY timestamp_hour) AS hajime_count,
            COUNT(CASE WHEN name = "raden" THEN 1 ELSE null END) OVER (PARTITION BY timestamp_hour) AS raden_count
        FROM
        (
            SELECT
                id,
                name,
                subcount,
                timestamp,
                SUBSTRING(timestamp, 0, 14) AS timestamp_hour
            FROM subs
            ORDER BY id ASC
        )
    )
    WHERE row_number > 5
)
DELETE FROM subs
WHERE id IN cte