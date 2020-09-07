#!/usr/bin/env bash

YML_FILE_BASE="routes.yml"
MICROSERVICES=$(cat ${YML_FILE_BASE} \
	| yq r - "microservices" \
	| grep -vE '^ |mongo|redis|mysql' \
	| sed 's@:.*@@g')
> $1
NUMBER_TEST=0
ALL_TESTS=$(grep -rE 'it\(.*:' ./test/ | awk '{print $2}' | sed "s@it('\|:@@g" | sed "s@it(\`@@g" | sort)
for TEST in ${ALL_TESTS}; do
	if [ "${LAST_TEST}" == "$(echo ${TEST} | sed 's@0.*@@g')" ]; then
		if [ ${NUMBER_TEST} -eq 1 ]; then
			continue
		fi
		NUMBER_TEST=$((NUMBER_TEST + 1))
	else
		NUMBER_TEST=1
	fi
	TIME=$(date +'%Y-%m-%dT%H:%M:%S')
	npm run test:single -- --fgrep=" ${TEST}"  test/**/**/*.spec.ts &> /dev/null
	if [ $? -ne 0 ]; then
		continue
	fi
	LAST_TEST=$(echo ${TEST} | sed 's@0.*@@g')
	ROUTES=$(docker logs ocariot-api-gateway --since "${TIME}"| grep -oE '\".*\" ' | awk '{print $2}')

	TOUCHED_SERVICES=""
	for SERVICE in ${MICROSERVICES}; do
		RESOURCES=$(cat ${YML_FILE_BASE} | yq r - "microservices.${SERVICE}.resources" | grep -vE '^ ' | sed 's@:.*@@g')
		for RESOURCE in ${RESOURCES}; do
			i=0
			COMMAND="yq r - microservices.${SERVICE}.resources.${RESOURCE}"
			while [ "$(cat ${YML_FILE_BASE} | ${COMMAND}.[${i}])" ]; do
				if [ "$(echo "${ROUTES}" | grep -E "$(cat ${YML_FILE_BASE} | ${COMMAND}.[${i}].path)")" ]; then
					DEPENDENCES=$(cat docker-compose.yml \
						| sed 's@ \|:.*@@g' \
						| grep -e "^mongo-${SERVICE}$" \
							-e "^redis-${SERVICE}$" \
							-e "^mysql-${SERVICE}$")
					TOUCHED_SERVICES="${TOUCHED_SERVICES} ${SERVICE} ${DEPENDENCES}"
				fi
				i=$((i+1))
			done
		done
	done

	if [ $(echo ${TOUCHED_SERVICES} | wc -w) -gt 0 ];then
		TOUCHED_SERVICES=$(echo ${TOUCHED_SERVICES} | sed 's@ @\n@g' | sort -u )
		NUMBER_SERVICES=$(echo -e "${TOUCHED_SERVICES}" | wc -l)
		MESSAGE=$(echo "Test Name: ${TEST} - Number de services Touched: ${NUMBER_SERVICES} - Services: "${TOUCHED_SERVICES})
		echo ${MESSAGE}
		echo ${MESSAGE} >> $1
	fi

done
exit ${CODE}
